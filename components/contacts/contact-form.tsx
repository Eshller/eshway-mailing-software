"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Phone } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().optional().refine((value) => {
    if (!value) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }, {
    message: "Please enter a valid email address.",
  }),
  company: z.string().optional(),
  tags: z.string().optional(),
  phone: z.string().optional().refine((value) => {
    if (!value) return true;
    return /^[0-9+\-()]*$/.test(value);
  }, {
    message: "Please enter a valid phone number.",
  })
});

export function ContactForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      tags: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    fetch("/api/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("data", data);
        if (data.error) {
          alert(data.error);
          toast({
            title: "Error adding contact",
            description: "Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Contact added successfully!",
            description: "Contact added successfully!",
            variant: "default",
          });
          console.log("data", data);
          form.reset();
        }
      })
      .catch((error) => {
        console.error("Error adding contact:", error.message);
        toast({
          title: "Error adding contact",
          description: "Please try again.",
          variant: "destructive",
        });
      });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone (Optional)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input placeholder="123-456-7890" {...field} className="peer ps-9" />
                  <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                    <Phone size={16} strokeWidth={2} aria-hidden="true" />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Acme Inc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="customer, lead" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="bg-[#d86dfc] hover:bg-[#c44ee7]">Add Contact</Button>
      </form>
    </Form>
  );
}