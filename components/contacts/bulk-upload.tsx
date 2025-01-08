"use client";

import { useEffect, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

import Papa from "papaparse";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";

export function BulkUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [csvData, setCSVData] = useState([]);
  const router = useRouter();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setFileName(files[0].name);
      handleFiles(files);
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      ['name', 'email', 'phone', 'tags'],  // Header row
      ['John Doe', 'johndoe@example.com', '9898989898', 'tag1,tag2'],
      ['Jane Smith', 'janesmith@example.com', '8712413212', 'tag3']
    ];

    const csvContent = template
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'contacts-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const csvFile = files.find(file => file.type === "text/csv");
    if (csvFile) {
      Papa.parse(csvFile, {
        header: true,
        skipEmptyLines: true,
        complete: async (results: any) => {
          setIsLoading(true);
          const data = results.data;
          const isValid = validateCSV(data);
          if (isValid) {
            setCSVData(data);
          } else {
            toast({
              title: "CSV file is not valid",
              description: "Please upload a valid CSV file",
              variant: "destructive",
            });
          }
          setIsLoading(false);
        }
      });

    } else {
      toast({
        title: "Please upload a valid CSV file",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/contacts", {
        method: "POST",
        body: JSON.stringify({ contacts: csvData }),
      });
      if (response.status === 201) {
        toast({
          title: "CSV file uploaded successfully!",
          description: "The CSV file has been successfully uploaded.",
        });
        setCSVData([]);
        setFileName("");
        setIsDragging(false);
        router.push("/contacts");
      }
      console.log("response", response);
    } catch (error) {
      toast({
        title: "Error uploading CSV file",
        description: "An error occurred while uploading the CSV file.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateCSV = (data: any[]) => {
    if (data.length === 0) return false;

    // Check headers and required columns
    const requiredHeaders = ["name", "email"];
    const headers = Object.keys(data[0]);

    // Ensure headers match expected structure
    return requiredHeaders.every((header) => headers.includes(header));
  };

  useEffect(() => {
    console.log("csvData", csvData);
  }, [csvData]);

  return (
    <div className="space-y-6">
      {isLoading && <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
      </div>}
      <div className="max-w-xl">
        <h3 className="text-lg font-medium mb-2">Bulk Upload Contacts</h3>
        <p className="text-gray-600 mb-4">
          Upload your contacts using a CSV file. Download our template to ensure your file is formatted correctly.
        </p>
        <Button variant="outline" className="mb-6" onClick={handleDownloadTemplate}>
          Download Template
        </Button>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${isDragging ? "border-[#d86dfc] bg-purple-50" : "border-gray-300"
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-4">
          <Upload className="h-12 w-12 text-gray-400" />
          {isLoading ? (<div className="flex flex-col items-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#d86dfc]" />
            <p className="text-lg text-gray-600 mt-2">Uploading...</p>
          </div>
          ) : (

            <div>
              <p className="text-lg font-medium">
                Drag and drop your CSV file here, or{" "}
                <label className="text-[#d86dfc] hover:text-[#c44ee7] cursor-pointer">
                  browse
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv"
                    onChange={handleFileInput}
                    disabled={isLoading}
                  />
                </label>
              </p>
              <p className="text-sm text-gray-500 mt-1">Supports CSV files up to 10MB</p>
              {fileName && <p className="text-sm mt-2 font-medium text-green-600">Selected File: {fileName}</p>}
            </div>
          )}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">Preview</h3>
        {csvData.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {csvData.slice(0, 5).map((contact: any) => (
                <TableRow key={contact.id}>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.phone}</TableCell>
                  <TableCell>{contact.company}</TableCell>
                  <TableCell>{contact.tags}</TableCell>
                </TableRow>
              ))}
              {csvData.length > 5 && (
                <TableRow>
                  <TableCell>
                    <TableCell>+{csvData.length - 5} More</TableCell>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
      {csvData.length > 0 && <Button onClick={handleSubmit}>Submit</Button>}
      <div className="bg-gray-50 rounded-lg p-4 mt-6">
        <h4 className="font-medium mb-2">CSV Format Requirements:</h4>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li>First row should contain column headers</li>
          <li>Required columns: name, email</li>
          <li>Optional columns: tags, phone</li>
          <li>Tags should be comma-separated</li>
        </ul>
      </div>
    </div>
  );
}