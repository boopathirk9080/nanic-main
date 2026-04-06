"use client";

import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Company } from "@/types";

interface CompanyTableProps {
  companies: Company[] | undefined;
  onEdit: (company: Company | null) => void;
  onDelete: (id: string) => void;
}

export default function CompanyTable({
  companies,
  onEdit,
  onDelete,
}: CompanyTableProps) {
  if (!companies || companies.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No companies added yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Contact Person</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.company_name}</TableCell>
              <TableCell>
                <code className="px-2 py-1 bg-muted rounded text-sm">
                  {c.company_code}
                </code>
              </TableCell>
              <TableCell>{c.contact_person ?? "-"}</TableCell>
              <TableCell>{c.contact_email ?? "-"}</TableCell>
              <TableCell>{c.contact_phone ?? "-"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(c)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm(`Delete ${c.company_name}?`)) {
                        onDelete(c.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
