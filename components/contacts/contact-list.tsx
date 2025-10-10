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
import { Search, Edit2, Trash2, Loader2, Check, X, Phone, ChevronLeft, ChevronRight, Eye, History, Mail, Filter, SortAsc, SortDesc } from "lucide-react";

import { Contact } from "@prisma/client";
import { toast } from "@/hooks/use-toast";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "../ui/select";
import { ContactEmailTracking } from "./contact-email-tracking";
import { ConfirmationDialog } from "../ui/confirmation-dialog";

export default function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectAll, setSelectAll] = useState(false);

  // Filter and sort states
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'createdAt' | 'updatedAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [emailStatusFilter, setEmailStatusFilter] = useState<'all' | 'valid' | 'invalid' | 'none'>('all');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [trackingContactId, setTrackingContactId] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    contactId: string | null;
    contactName: string;
  }>({
    isOpen: false,
    contactId: null,
    contactName: "",
  });
  const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState<{
    isOpen: boolean;
    count: number;
  }>({
    isOpen: false,
    count: 0,
  });
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
        // Build query parameters
        const params = new URLSearchParams();
        params.append('sortBy', sortBy);
        params.append('sortOrder', sortOrder);
        if (emailStatusFilter !== 'all') {
          params.append('emailStatus', emailStatusFilter);
        }
        if (tagFilter) {
          params.append('tags', tagFilter);
        }

        const response = await fetch(`/api/contacts?${params.toString()}`);
        const data = await response.json();
        setContacts(data);
      } catch (error: any) {
        toast({
          title: "Error fetching contacts",
          description: error?.message || "Please try again.",
          variant: "destructive",
        });
        console.error("Error fetching contacts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContacts();
  }, [sortBy, sortOrder, emailStatusFilter, tagFilter]);

  const handleDeleteSelected = () => {
    if (selectedContacts.length === 0) return;
    setBulkDeleteConfirmation({
      isOpen: true,
      count: selectedContacts.length,
    });
  };

  const confirmBulkDelete = async (dontAskAgain?: boolean) => {
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
    } catch (error: any) {
      toast({
        title: "Error deleting selected contacts",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
    setBulkDeleteConfirmation({ isOpen: false, count: 0 });
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
      email: contact.email || "",
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
    } catch (error: any) {
      toast({
        title: "Error editing contact",
        description: error?.message || "Please try again.",
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

  const handleDelete = (id: string) => {
    const contact = contacts.find(c => c.id === id);
    if (!contact) return;

    setDeleteConfirmation({
      isOpen: true,
      contactId: id,
      contactName: contact.name,
    });
  };

  const confirmDelete = async (dontAskAgain?: boolean) => {
    if (!deleteConfirmation.contactId) return;

    const prevContacts = [...contacts];
    const filteredContacts = prevContacts.filter((contact) => contact.id !== deleteConfirmation.contactId);
    setContacts(filteredContacts);
    console.log("Delete contact with ID:", deleteConfirmation.contactId);

    try {
      const response = await fetch(`/api/contacts/${deleteConfirmation.contactId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast({
          title: "Contact deleted successfully",
          variant: "default",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error deleting contact",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    }
    setDeleteConfirmation({ isOpen: false, contactId: null, contactName: "" });
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get unique tags for filter dropdown
  const uniqueTags = Array.from(new Set(
    contacts.flatMap(contact =>
      contact.tags?.split(',').map(tag => tag.trim()).filter(tag => tag) || []
    )
  ));

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
          <div className="flex gap-2 my-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSelected}
              disabled={selectedContacts.length === 0}
            >
              Delete Selected
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Sort By */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date Created</SelectItem>
                  <SelectItem value="updatedAt">Date Updated</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Order</label>
              <div className="flex gap-2">
                <Button
                  variant={sortOrder === 'desc' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortOrder('desc')}
                  className="gap-1"
                >
                  <SortDesc className="h-3 w-3" />
                  Newest
                </Button>
                <Button
                  variant={sortOrder === 'asc' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortOrder('asc')}
                  className="gap-1"
                >
                  <SortAsc className="h-3 w-3" />
                  Oldest
                </Button>
              </div>
            </div>

            {/* Email Status Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Email Status</label>
              <Select value={emailStatusFilter} onValueChange={(value: any) => setEmailStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contacts</SelectItem>
                  <SelectItem value="valid">Valid Emails</SelectItem>
                  <SelectItem value="invalid">Invalid Emails</SelectItem>
                  <SelectItem value="none">No Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tag Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by Tag</label>
              <Select value={tagFilter || "all"} onValueChange={(value) => setTagFilter(value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {uniqueTags.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSortBy('createdAt');
                setSortOrder('desc');
                setEmailStatusFilter('all');
                setTagFilter('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      )}

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
                <TableHead>Email Status</TableHead>
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
                        placeholder="Enter email (optional)"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        {contact.email ? (
                          <>
                            <span className={contact.emailValidated ? "text-green-600" : "text-red-600"}>
                              {contact.email}
                            </span>
                            {contact.emailValidated ? (
                              <span className="text-green-500 text-xs">✓</span>
                            ) : (
                              <span className="text-red-500 text-xs" title="Invalid email format">⚠</span>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400 italic">No email</span>
                        )}
                      </div>
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
                      <div className="flex gap-2 flex-wrap">
                        {contact.tags?.split(",").map((tag: string) => (
                          <span
                            key={tag}
                            className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
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
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {contact.email ? (
                        <>
                          <span className={`text-xs px-2 py-1 rounded-full ${contact.emailValidated
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {contact.emailValidated ? 'Valid' : 'Invalid'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {contact.emailValidated ? '✓' : '⚠'}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          No Email
                        </span>
                      )}
                    </div>
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
                          {contact.email && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setTrackingContactId(contact.id)}
                              title="View email tracking"
                            >
                              <History className="h-4 w-4" />
                            </Button>
                          )}
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

      {/* Email Tracking Modal */}
      {trackingContactId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Email Tracking</h2>
                <Button
                  variant="ghost"
                  onClick={() => setTrackingContactId(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {(() => {
                const contact = contacts.find(c => c.id === trackingContactId);
                if (!contact) return null;

                return (
                  <ContactEmailTracking
                    contactId={contact.id}
                    contactName={contact.name}
                    contactEmail={contact.email || undefined}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Single Contact Delete Confirmation */}
      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, contactId: null, contactName: "" })}
        onConfirm={confirmDelete}
        title="Delete Contact"
        description={`Are you sure you want to delete "${deleteConfirmation.contactName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        showDontAskAgain={true}
        dontAskAgainKey="contactDeleteConfirmation"
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationDialog
        isOpen={bulkDeleteConfirmation.isOpen}
        onClose={() => setBulkDeleteConfirmation({ isOpen: false, count: 0 })}
        onConfirm={confirmBulkDelete}
        title="Delete Selected Contacts"
        description={`Are you sure you want to delete ${bulkDeleteConfirmation.count} selected contact${bulkDeleteConfirmation.count > 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        variant="destructive"
        showDontAskAgain={true}
        dontAskAgainKey="bulkContactDeleteConfirmation"
      />
    </div>
  );
}