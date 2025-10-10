const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

async function migrateContacts() {
    try {
        console.log('Starting contact migration...');

        // Get all contacts
        const contacts = await prisma.contact.findMany();
        console.log(`Found ${contacts.length} contacts to migrate`);

        let updated = 0;
        let skipped = 0;

        for (const contact of contacts) {
            const emailValidated = contact.email ? isValidEmail(contact.email) : false;

            if (contact.emailValidated !== emailValidated) {
                await prisma.contact.update({
                    where: { id: contact.id },
                    data: { emailValidated }
                });
                updated++;
                console.log(`Updated contact ${contact.name}: emailValidated = ${emailValidated}`);
            } else {
                skipped++;
            }
        }

        console.log(`Migration completed: ${updated} updated, ${skipped} skipped`);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

migrateContacts();






