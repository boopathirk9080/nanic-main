// "use client";

// import { Package, Pencil, Trash2 } from "lucide-react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { ImportProduct } from "@/types";

// interface ImportProductTableProps {
//   importProducts: ImportProduct[];
//   onEdit: (product: ImportProduct) => void;
//   onDelete: (id: string) => void;
//   onAddToInventory: (product: ImportProduct) => void;
// }

// export default function ImportProductTable({
//   importProducts,
//   onEdit,
//   onDelete,
//   onAddToInventory,
// }: ImportProductTableProps) {
//   if (importProducts.length === 0) {
//     return (
//       <div className="text-center py-12 text-muted-foreground">
//         No import products yet.
//       </div>
//     );
//   }

//   return (
//     <div className="overflow-x-auto">
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Product</TableHead>
//             <TableHead>Brand Code</TableHead>
//             <TableHead>Company</TableHead>
//             <TableHead>Category</TableHead>
//             <TableHead className="text-right">Strips / Pack</TableHead>
//             <TableHead className="text-right">Tablets / Strip</TableHead>
//             <TableHead className="text-right">Import Price</TableHead>
//             <TableHead className="text-right">Actions</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {importProducts.map((p) => {
//             const totalTablets = p.strip_count * p.per_strip_tablet_count;
//             return (
//               <TableRow key={p.id}>
//                 <TableCell className="font-medium">{p.product_name}</TableCell>
//                 <TableCell>
//                   <code className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
//                     {p.brand_code}
//                   </code>
//                 </TableCell>
//                 <TableCell>
//                   {p.companies?.company_name ?? "-"} (
//                   {p.companies?.company_code ?? "-"})
//                 </TableCell>
//                 <TableCell>
//                   <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
//                     {p.category ?? "-"}
//                   </span>
//                 </TableCell>
//                 <TableCell className="text-right">{p.strip_count}</TableCell>
//                 <TableCell className="text-right">
//                   {p.per_strip_tablet_count}
//                 </TableCell>
//                 <TableCell className="text-right">
//                   ₹{p.import_price.toFixed(2)}
//                 </TableCell>
//                 <TableCell className="text-right">
//                   <div className="flex justify-end gap-1">
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       title="Add to Inventory"
//                       onClick={() => onAddToInventory(p)}
//                     >
//                       <Package className="h-4 w-4" />
//                     </Button>
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       onClick={() => onEdit(p)}
//                     >
//                       <Pencil className="h-4 w-4" />
//                     </Button>
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       onClick={() => {
//                         if (confirm(`Delete ${p.product_name}?`)) {
//                           onDelete(p.id);
//                         }
//                       }}
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </TableCell>
//               </TableRow>
//             );
//           })}
//         </TableBody>
//       </Table>
//     </div>
//   );
// }

// "use client";

// import { Package, Pencil, Trash2 } from "lucide-react";
// import { useState } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// interface ImportProduct {
//   id: string;
//   company_id: string;
//   brand_code: string;
//   product_name: string;
//   category: string;
//   strip_count: number;
//   per_strip_tablet_count: number;
//   import_price: number;
//   companies?: {
//     company_name: string;
//     company_code: string;
//   };
// }

// interface ImportProductTableProps {
//   importProducts: ImportProduct[];
//   onEdit: (product: ImportProduct) => void;
//   onDelete: (id: string) => void;
//   onAddToInventory: (product: ImportProduct, strips: number) => void;
// }

// export default function ImportProductTable({
//   importProducts,
//   onEdit,
//   onDelete,
//   onAddToInventory,
// }: ImportProductTableProps) {
//   const [stockDialog, setStockDialog] = useState<{
//     open: boolean;
//     product?: ImportProduct;
//   }>({ open: false });
//   const [stripsToAdd, setStripsToAdd] = useState(0);

//   const handleAddToInventory = () => {
//     if (!stockDialog.product || stripsToAdd <= 0) {
//       alert("Please enter a valid number of strips");
//       return;
//     }

//     onAddToInventory(stockDialog.product, stripsToAdd);
//     setStockDialog({ open: false });
//     setStripsToAdd(0);
//   };

//   if (importProducts.length === 0) {
//     return (
//       <div className="text-center py-12 text-muted-foreground">
//         No import products yet.
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="overflow-x-auto">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Product</TableHead>
//               <TableHead>Brand Code</TableHead>
//               <TableHead>Company</TableHead>
//               <TableHead>Category</TableHead>
//               <TableHead className="text-right">Strips / Pack</TableHead>
//               <TableHead className="text-right">Tablets / Strip</TableHead>
//               <TableHead className="text-right">Total Tablets</TableHead>
//               <TableHead className="text-right">Import Price</TableHead>
//               <TableHead className="text-right">Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {importProducts.map((p) => {
//               const totalTablets = p.strip_count * p.per_strip_tablet_count;
//               return (
//                 <TableRow key={p.id}>
//                   <TableCell className="font-medium">
//                     {p.product_name}
//                   </TableCell>
//                   <TableCell>
//                     <code className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm font-mono">
//                       {p.brand_code}
//                     </code>
//                   </TableCell>
//                   <TableCell>
//                     {p.companies?.company_name ?? "-"} (
//                     {p.companies?.company_code ?? "-"})
//                   </TableCell>
//                   <TableCell>
//                     <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
//                       {p.category ?? "-"}
//                     </span>
//                   </TableCell>
//                   <TableCell className="text-right">{p.strip_count}</TableCell>
//                   <TableCell className="text-right">
//                     {p.per_strip_tablet_count}
//                   </TableCell>
//                   <TableCell className="text-right font-semibold">
//                     {totalTablets}
//                   </TableCell>
//                   <TableCell className="text-right">
//                     ₹{p.import_price.toFixed(2)}
//                   </TableCell>
//                   <TableCell className="text-right">
//                     <div className="flex justify-end gap-1">
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         title="Add to Inventory"
//                         onClick={() => {
//                           setStockDialog({ open: true, product: p });
//                           setStripsToAdd(0);
//                         }}
//                       >
//                         <Package className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={() => onEdit(p)}
//                       >
//                         <Pencil className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={() => {
//                           if (confirm(`Delete ${p.product_name}?`)) {
//                             onDelete(p.id);
//                           }
//                         }}
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               );
//             })}
//           </TableBody>
//         </Table>
//       </div>

//       {/* Stock Addition Dialog */}
//       <Dialog
//         open={stockDialog.open}
//         onOpenChange={(open) => setStockDialog({ open })}
//       >
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>
//               Add to Inventory: {stockDialog.product?.product_name}
//             </DialogTitle>
//             <DialogDescription>
//               Specify how many strips to add to your inventory
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div className="bg-blue-50 p-3 rounded space-y-1">
//               <p className="text-sm">
//                 <span className="font-semibold">Brand Code:</span>{" "}
//                 {stockDialog.product?.brand_code}
//               </p>
//               <p className="text-sm">
//                 <span className="font-semibold">Company:</span>{" "}
//                 {stockDialog.product?.companies?.company_name}
//               </p>
//               <p className="text-sm">
//                 <span className="font-semibold">Import Price:</span> ₹
//                 {stockDialog.product?.import_price.toFixed(2)}
//               </p>
//               <p className="text-sm">
//                 <span className="font-semibold">Tablets per Strip:</span>{" "}
//                 {stockDialog.product?.per_strip_tablet_count}
//               </p>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="strips">Number of Strips to Add</Label>
//               <Input
//                 id="strips"
//                 type="number"
//                 min="1"
//                 value={stripsToAdd || ""}
//                 onChange={(e) => setStripsToAdd(parseInt(e.target.value) || 0)}
//                 placeholder="Enter number of strips"
//               />
//             </div>

//             {stripsToAdd > 0 && stockDialog.product && (
//               <div className="bg-green-50 p-3 rounded space-y-1">
//                 <p className="text-sm font-semibold text-green-800">
//                   Inventory Summary:
//                 </p>
//                 <p className="text-sm">
//                   <span className="font-semibold">Strips:</span> {stripsToAdd}
//                 </p>
//                 <p className="text-sm">
//                   <span className="font-semibold">Total Tablets:</span>{" "}
//                   {stripsToAdd * stockDialog.product.per_strip_tablet_count}
//                 </p>
//                 <p className="text-sm">
//                   <span className="font-semibold">Total Cost:</span> ₹
//                   {(stripsToAdd * stockDialog.product.import_price).toFixed(2)}
//                 </p>
//               </div>
//             )}

//             <div className="flex justify-end gap-2">
//               <Button
//                 variant="outline"
//                 onClick={() => {
//                   setStockDialog({ open: false });
//                   setStripsToAdd(0);
//                 }}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={handleAddToInventory}
//                 disabled={stripsToAdd <= 0}
//               >
//                 Add to Inventory
//               </Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }

"use client";

import { Package, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImportProduct {
  id: string;
  company_id: string;
  brand_code: string;
  product_name: string;
  category: string;
  strip_count: number;
  per_strip_tablet_count: number;
  import_price: number;
  companies?: {
    company_name: string;
    company_code: string;
  };
}

interface ImportProductTableProps {
  importProducts: ImportProduct[];
  onEdit: (product: ImportProduct) => void;
  onDelete: (id: string) => void;
  onAddToInventory: (product: ImportProduct, strips: number) => void;
}

export default function ImportProductTable({
  importProducts,
  onEdit,
  onDelete,
  onAddToInventory,
}: ImportProductTableProps) {
  const [stockDialog, setStockDialog] = useState<{
    open: boolean;
    product?: ImportProduct;
  }>({ open: false });
  const [stripsToAdd, setStripsToAdd] = useState(0);

  const handleAddToInventory = () => {
    if (!stockDialog.product || stripsToAdd <= 0) {
      alert("Please enter a valid number of strips");
      return;
    }

    // Validate available strips
    if (stripsToAdd > stockDialog.product.strip_count) {
      alert(`Only ${stockDialog.product.strip_count} strips available`);
      return;
    }

    onAddToInventory(stockDialog.product, stripsToAdd);
    setStockDialog({ open: false });
    setStripsToAdd(0);
  };

  if (importProducts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No import products yet.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Brand Code</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Strips / Pack</TableHead>
              <TableHead className="text-right">Tablets / Strip</TableHead>
              <TableHead className="text-right">Total Tablets</TableHead>
              <TableHead className="text-right">Import Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {importProducts.map((p) => {
              const totalTablets = p.strip_count * p.per_strip_tablet_count;
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    {p.product_name}
                  </TableCell>
                  <TableCell>
                    <code className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm font-mono">
                      {p.brand_code}
                    </code>
                  </TableCell>
                  <TableCell>
                    {p.companies?.company_name ?? "-"} (
                    {p.companies?.company_code ?? "-"})
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {p.category ?? "-"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        p.strip_count === 0 ? "text-red-500 font-semibold" : ""
                      }
                    >
                      {p.strip_count}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {p.per_strip_tablet_count}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {totalTablets}
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{p.import_price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Add to Inventory"
                        onClick={() => {
                          setStockDialog({ open: true, product: p });
                          setStripsToAdd(0);
                        }}
                        disabled={p.strip_count === 0}
                      >
                        <Package className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(p)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Delete ${p.product_name}?`)) {
                            onDelete(p.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Stock Addition Dialog */}
      <Dialog
        open={stockDialog.open}
        onOpenChange={(open) => setStockDialog({ open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add to Inventory: {stockDialog.product?.product_name}
            </DialogTitle>
            <DialogDescription>
              Specify how many strips to add to your inventory
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded space-y-1">
              <p className="text-sm">
                <span className="font-semibold">Brand Code:</span>{" "}
                {stockDialog.product?.brand_code}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Company:</span>{" "}
                {stockDialog.product?.companies?.company_name}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Import Price:</span> ₹
                {stockDialog.product?.import_price.toFixed(2)}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Tablets per Strip:</span>{" "}
                {stockDialog.product?.per_strip_tablet_count}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Available Strips:</span>{" "}
                <span className="text-green-600 font-bold">
                  {stockDialog.product?.strip_count}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="strips">Number of Strips to Add</Label>
              <Input
                id="strips"
                type="number"
                min="1"
                max={stockDialog.product?.strip_count}
                value={stripsToAdd || ""}
                onChange={(e) => setStripsToAdd(parseInt(e.target.value) || 0)}
                placeholder="Enter number of strips"
              />
              {stockDialog.product && (
                <p className="text-xs text-muted-foreground">
                  Maximum: {stockDialog.product.strip_count} strips available
                </p>
              )}
            </div>

            {stripsToAdd > 0 && stockDialog.product && (
              <div className="bg-green-50 p-3 rounded space-y-1">
                <p className="text-sm font-semibold text-green-800">
                  Inventory Summary:
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Strips:</span> {stripsToAdd}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Total Tablets:</span>{" "}
                  {stripsToAdd * stockDialog.product.per_strip_tablet_count}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Total Cost:</span> ₹
                  {(stripsToAdd * stockDialog.product.import_price).toFixed(2)}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Remaining in Import:</span>{" "}
                  <span className="text-orange-600">
                    {stockDialog.product.strip_count - stripsToAdd} strips
                  </span>
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setStockDialog({ open: false });
                  setStripsToAdd(0);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddToInventory}
                disabled={
                  stripsToAdd <= 0 ||
                  (stockDialog.product &&
                    stripsToAdd > stockDialog.product.strip_count)
                }
              >
                Add to Inventory
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
