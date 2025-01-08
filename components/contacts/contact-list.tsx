"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Edit2, Trash2, Loader2, Check, X, Phone, ChevronLeft, ChevronRight } from "lucide-react";

import { Contact } from "@prisma/client";
import { toast } from "@/hooks/use-toast";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "../ui/select";

export default function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectAll, setSelectAll] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<{ [key: string]: string | string[] }>({
    name: "",
    email: "",
    company: "",
    phone: "",
    tags: [],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/contacts");
        const data = await response.json();
        setContacts(data);
      } catch (error) {
        toast({
          title: "Error fetching contacts",
          description: "Please try again.",
          variant: "destructive",
        });
        console.error("Error fetching contacts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const handleDeleteSelected = async () => {
    const prevContacts = [...contacts];
    const filteredContacts = prevContacts.filter(
      (contact) => !selectedContacts.includes(contact.id)
    );
    setContacts(filteredContacts);

    try {
      setIsLoading(true);
      await Promise.all(
        selectedContacts.map((id) =>
          fetch(`/api/contacts/${id}`, { method: "DELETE" })
        )
      );
      toast({
        title: "Selected contacts deleted successfully",
        variant: "default",
      });
      setSelectedContacts([]);
      setSelectAll(false);
    } catch (error) {
      toast({
        title: "Error deleting selected contacts",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedContacts([]);
    } else {
      const currentIds = paginatedContacts.map((contact) => contact.id);
      setSelectedContacts(currentIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectContact = (id: string) => {
    console.log("Select contact with ID:", id);
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter((contactId) => contactId !== id));
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContactId(contact.id);
    setEditFields({
      name: contact.name,
      email: contact.email,
      phone: contact.phone || "",
      company: contact.company || "",
      tags: contact.tags?.split(",") || [],
    });
  };
  const handleSave = async (id: string) => {
    const updatedContact = {
      ...editFields,
      id,
      tags: Array.isArray(editFields.tags) ? editFields.tags.join(", ") : editFields.tags
    };
    setContacts((prevContacts) =>
      prevContacts.map((contact) =>
        contact.id === id
          ? { ...contact, ...updatedContact }
          : contact
      )
    );
    console.log("Edit contact with ID:", id);

    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ id, ...editFields, tags: Array.isArray(editFields.tags) ? editFields.tags.join(",") : editFields.tags }),
      });
      if (response.status === 200) {
        toast({
          title: "Contact updated successfully",
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Error editing contact",
        description: "Please try again.",
        variant: "destructive",
      });
      setContacts((prevContacts) =>
        prevContacts.map((contact) =>
          contact.id === id ? { ...contact } : contact
        )
      );
    } finally {
      setEditingContactId(null);
    }
  };

  const handleDelete = async (id: string) => {

    const prevContacts = [...contacts];
    const filteredContacts = prevContacts.filter((contact) => contact.id !== id);
    setContacts(filteredContacts);
    console.log("Delete contact with ID:", id);

    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast({
          title: "Contact deleted successfully",
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Error deleting contact",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1 justify-between">
          <div className="flex justify-between">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button
            variant="destructive"
            onClick={handleDeleteSelected}
            disabled={selectedContacts.length === 0}
            className="my-4 justify-end"
          >
            Delete Selected
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <input type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="h-4 w-4 checked:bg-[#df86dfc]"
                  />
                  {/* <Checkbox
                    checked={selectAll}
                    onChange={handleSelectAll}
                  /> */}
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <input type="checkbox"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => handleSelectContact(contact.id)}
                      className="w-4 h-4 checked:bg-[#df86dfc]"
                    />
                    {/* <Checkbox
                      id={contact.id}
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => handleSelectContact(contact.id)}
                    /> */}
                  </TableCell>
                  <TableCell>
                    {editingContactId === contact.id ? (
                      <Input
                        value={editFields.name}
                        onChange={(e) => setEditFields({ ...editFields, name: e.target.value })}
                      />
                    ) : (
                      contact.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingContactId === contact.id ? (
                      <Input
                        value={editFields.email}
                        onChange={(e) => setEditFields({ ...editFields, email: e.target.value })}
                      />
                    ) : (
                      contact.email
                    )}
                  </TableCell>
                  <TableCell>
                    {editingContactId === contact.id ? (
                      <div className="relative">
                        <Input
                          value={editFields.phone}
                          onChange={(e) => setEditFields({ ...editFields, phone: e.target.value })}
                          className="peer ps-9"
                          placeholder="Phone"
                          type="tel"
                        />
                        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                          <Phone size={16} strokeWidth={2} aria-hidden="true" />
                        </div>
                      </div>
                      // <Input
                      //   value={editFields.phone}
                      //   onChange={(e) => setEditFields({ ...editFields, phone: e.target.value })}
                      // />
                    ) : (
                      contact.phone
                    )}
                  </TableCell>
                  <TableCell>
                    {editingContactId === contact.id ? (
                      <Input
                        value={editFields.company}
                        onChange={(e) => setEditFields({ ...editFields, company: e.target.value })}
                      />
                    ) : (
                      contact.company
                    )}
                  </TableCell>
                  <TableCell>
                    {editingContactId === contact.id ? (
                      <Input
                        value={editFields.tags}
                        onChange={(e) =>
                          setEditFields({ ...editFields, tags: e.target.value })
                        }
                      />
                    ) : (
                      contact.tags?.split(",").map((tag: string) => (
                        <span
                          key={tag}
                          className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))
                    )}
                    {/* <div className="flex gap-2">
                      {contact.tags?.split(",").map((tag: string) => (
                        <span
                          key={tag}
                          className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div> */}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {editingContactId === contact.id ? (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleSave(contact.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingContactId(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(contact)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(contact.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center p-4 border-t">
            <div className="flex items-center space-x-2">
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select page size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Showing {paginatedContacts.length} of {filteredContacts.length} contacts</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span>Page {currentPage} of {totalPages}</span>
              <Button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}