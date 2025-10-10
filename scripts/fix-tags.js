const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixTags() {
    try {
        console.log('🔍 Finding contacts with iitb-alumn-500-* tags...');

        // Find all contacts with tags that match the pattern iitb-alumn-500-{number}
        const contacts = await prisma.contact.findMany({
            where: {
                tags: {
                    contains: 'iitb-alumn-500-'
                }
            }
        });

        console.log(`📊 Found ${contacts.length} contacts with iitb-alumn-500-* tags`);

        if (contacts.length === 0) {
            console.log('✅ No contacts found with the pattern. Nothing to fix!');
            return;
        }

        // Analyze what we found
        const tagCounts = {};
        const contactsToUpdate = [];

        contacts.forEach(contact => {
            const tags = contact.tags?.split(',').map(tag => tag.trim()) || [];
            tags.forEach(tag => {
                if (tag.includes('iitb-alumn-500-')) {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;

                    // Check if this contact needs updating (exclude 1 and 2, update 3+)
                    const tagNumber = tag.match(/iitb-alumn-500-(\d+)/);
                    if (tagNumber) {
                        const number = parseInt(tagNumber[1]);
                        if (number >= 3) {
                            // This contact needs updating
                            const existingUpdate = contactsToUpdate.find(c => c.id === contact.id);
                            if (!existingUpdate) {
                                contactsToUpdate.push({
                                    id: contact.id,
                                    name: contact.name,
                                    currentTags: contact.tags,
                                    newTags: contact.tags?.replace(/iitb-alumn-500-\d+/g, 'iitb-alumn-500-3') || ''
                                });
                            }
                        }
                    }
                }
            });
        });

        console.log('\n📋 Current tag distribution:');
        Object.entries(tagCounts).forEach(([tag, count]) => {
            const tagNumber = tag.match(/iitb-alumn-500-(\d+)/);
            const number = tagNumber ? parseInt(tagNumber[1]) : 0;
            const status = number <= 2 ? '✅ KEEP' : '🔄 CHANGE';
            console.log(`  ${tag}: ${count} contacts ${status}`);
        });

        console.log(`\n🔄 Contacts that will be updated: ${contactsToUpdate.length}`);

        if (contactsToUpdate.length === 0) {
            console.log('✅ No contacts need updating! All tags are already correct.');
            return;
        }

        // Show first 10 examples of what will change
        console.log('\n📝 Preview of changes (first 10):');
        contactsToUpdate.slice(0, 10).forEach((contact, index) => {
            console.log(`  ${index + 1}. ${contact.name}`);
            console.log(`     FROM: "${contact.currentTags}"`);
            console.log(`     TO:   "${contact.newTags}"`);
            console.log('');
        });

        if (contactsToUpdate.length > 10) {
            console.log(`     ... and ${contactsToUpdate.length - 10} more contacts`);
        }

        // Summary
        const tagsToChange = Object.keys(tagCounts).filter(tag => {
            const tagNumber = tag.match(/iitb-alumn-500-(\d+)/);
            return tagNumber && parseInt(tagNumber[1]) >= 3;
        });

        console.log(`\n📊 Summary:`);
        console.log(`  • Tags to keep unchanged: iitb-alumn-500-1, iitb-alumn-500-2`);
        console.log(`  • Tags to merge into iitb-alumn-500-3: ${tagsToChange.join(', ')}`);
        console.log(`  • Total contacts to update: ${contactsToUpdate.length}`);

        // Ask for confirmation
        console.log('\n❓ Do you want to proceed with these changes?');
        console.log('   This will merge all iitb-alumn-500-3+ tags into iitb-alumn-500-3');
        console.log('   while preserving iitb-alumn-500-1 and iitb-alumn-500-2');

        // Execute the updates
        console.log('\n🚀 Performing updates...');

        let successCount = 0;
        for (const contact of contactsToUpdate) {
            try {
                await prisma.contact.update({
                    where: { id: contact.id },
                    data: { tags: contact.newTags }
                });
                console.log(`✅ Updated ${contact.name}`);
                successCount++;
            } catch (error) {
                console.error(`❌ Failed to update ${contact.name}:`, error.message);
            }
        }

        console.log(`\n🎉 Successfully updated ${successCount} out of ${contactsToUpdate.length} contacts!`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixTags();
