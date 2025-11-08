"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";

interface Product {
  id: string;
  name: string;
  sku: string;
  brand_code?: string;
  company_id?: string;
  import_product_id?: string;
  strip_count: number;
  per_strip_tablet_count: number;
  total_tablets?: number;
  quantity: number;
  cost_price: number;
  selling_price: number;
  unit_price: number;
  category: string;
  description: string;
  company_name?: string;
}

interface ImportProduct {
  id: string;
  strip_count: number;
  per_strip_tablet_count: number;
}

interface ProductInventoryTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onUpdateStock: (id: string, strips: number) => void;
}

export default function ProductInventoryTable({
  products,
  onEdit,
  onDelete,
  onUpdateStock,
}: ProductInventoryTableProps) {
  const [stockDialog, setStockDialog] = useState<{
    open: boolean;
    product?: Product;
  }>({ open: false });

  const [stockInput, setStockInput] = useState({
    strips: 0,
    action: "add" as "add" | "remove",
  });

  const [importProduct, setImportProduct] = useState<ImportProduct | null>(null);
  const [loadingImport, setLoadingImport] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // RE-FETCH IMPORT DATA EVERY TIME DIALOG OPENS
  useEffect(() => {
    if (!stockDialog.open || !stockDialog.product?.import_product_id) {
      setImportProduct(null);
      return;
    }

    const fetchImportProduct = async () => {
      setLoadingImport(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("import_products")
          .select("id, strip_count, per_strip_tablet_count")
          .eq("id", stockDialog.product!.import_product_id)
          .single();

        if (error) throw error;
        setImportProduct(data);
      } catch (err: any) {
        setError("Failed to load import data: " + err.message);
        console.error(err);
      } finally {
        setLoadingImport(false);
      }
    };

    fetchImportProduct();
  }, [stockDialog.open, stockDialog.product?.import_product_id, supabase]);

  // Validation
  const validateInput = () => {
    const currentStrips = stockDialog.product?.strip_count || 0;
    const inputStrips = stockInput.strips;

    if (inputStrips <= 0) return { valid: false, message: "Enter a valid number of strips." };

    if (stockInput.action === "add") {
      const availableInImport = importProduct?.strip_count ?? 0;
      if (inputStrips > availableInImport) {
        return {
          valid: false,
          message: `Only ${availableInImport} strips available in import catalog.`,
        };
      }
    }

    if (stockInput.action === "remove") {
      if (inputStrips > currentStrips) {
        return {
          valid: false,
          message: `Cannot remove ${inputStrips} strips. Only ${currentStrips} available.`,
        };
      }
    }

    return { valid: true, message: "" };
  };

  const { valid, message } = validateInput();

  // const handleStockUpdate = async () => {
  //   if (!stockDialog.product || !valid || loadingImport) return;

  //   const currentStrips = stockDialog.product.strip_count;
  //   const newStrips =
  //     stockInput.action === "add"
  //       ? currentStrips + stockInput.strips
  //       : currentStrips - stockInput.strips;

  //   try {
  //     // RE-FETCH LATEST import_product BEFORE UPDATE
  //     if (stockInput.action === "add" && stockDialog.product.import_product_id) {
  //       const { data: latest, error: fetchError } = await supabase
  //         .from("import_products")
  //         .select("strip_count")
  //         .eq("id", stockDialog.product.import_product_id)
  //         .single();

  //       if (fetchError) throw fetchError;

  //       const available = latest.strip_count;
  //       if (stockInput.strips > available) {
  //         setError(`Only ${available} strips available now.`);
  //         return;
  //       }

  //       const remaining = available - stockInput.strips;
  //       const { error: updateError } = await supabase
  //         .from("import_products")
  //         .update({ strip_count: remaining })
  //         .eq("id", stockDialog.product.import_product_id);

  //       if (updateError) throw updateError;
  //     }

  //     // Update product stock
  //     onUpdateStock(stockDialog.product.id, newStrips);

  //     // Reset
  //     setStockDialog({ open: false });
  //     setStockInput({ strips: 0, action: "add" });
  //     setImportProduct(null);
  //     setError(null);
  //   } catch (err: any) {
  //     setError("Update failed: " + err.message);
  //   }
  // };

  const handleStockUpdate = async () => {
    if (!stockDialog.product || !valid || loadingImport) return;

    const currentStrips = stockDialog.product.strip_count;
    const newStrips =
      stockInput.action === "add"
        ? currentStrips + stockInput.strips
        : currentStrips - stockInput.strips;

    try {
      // RE-FETCH LATEST import_product BEFORE UPDATE (validation only)
      if (stockInput.action === "add" && stockDialog.product.import_product_id) {
        const { data: latest, error: fetchError } = await supabase
          .from("import_products")
          .select("strip_count")
          .eq("id", stockDialog.product.import_product_id)
          .single();

        if (fetchError) throw fetchError;

        const available = latest.strip_count;
        if (stockInput.strips > available) {
          setError(`Only ${available} strips available now.`);
          return;
        }
        
        // DO NOT update import_products here - let parent handle it
      }

      // Update product stock (parent will handle import_products deduction)
      onUpdateStock(stockDialog.product.id, newStrips);

      // Reset
      setStockDialog({ open: false });
      setStockInput({ strips: 0, action: "add" });
      setImportProduct(null);
      setError(null);
    } catch (err: any) {
      setError("Update failed: " + err.message);
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No products in inventory. Add products from import catalog.
      </div>
    );
  }

  const calculateProfitMargin = (cost: number, selling: number) => {
    if (cost === 0) return 0;
    return (((selling - cost) / cost) * 100).toFixed(1);
  };

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
              <TableHead className="text-right">Strips</TableHead>
              <TableHead className="text-right">Per Strip</TableHead>
              <TableHead className="text-right">Total Tablets</TableHead>
              <TableHead className="text-right">Cost Price</TableHead>
              <TableHead className="text-right">Selling Price</TableHead>
              <TableHead className="text-right">Profit %</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const totalTablets =
                product.total_tablets ||
                product.strip_count * product.per_strip_tablet_count;
              const profitMargin = calculateProfitMargin(
                product.cost_price,
                product.selling_price
              );
              const isLowStock = totalTablets < 50;

              return (
                <TableRow
                  key={product.id}
                  className={isLowStock ? "bg-red-50" : ""}
                >
                  <TableCell className="font-medium">
                    <div>
                      {product.name}
                      {isLowStock && (
                        <span className="ml-2 text-xs px-2 py-1 bg-red-200 text-red-800 rounded">
                          Low Stock
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.brand_code ? (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm font-mono">
                        {product.brand_code}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{product.company_name || "-"}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {product.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {product.strip_count}
                  </TableCell>
                  <TableCell className="text-right">
                    {product.per_strip_tablet_count}
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg">
                    {totalTablets}
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{product.cost_price?.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{product.selling_price?.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        parseFloat(profitMargin) > 20
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {profitMargin}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setStockDialog({ open: true, product });
                          setStockInput({ strips: 0, action: "add" });
                          setError(null);
                        }}
                      >
                        <Package className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (
                            confirm(
                              `Delete ${product.name}? This action cannot be undone.`
                            )
                          ) {
                            onDelete(product.id);
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

      {/* Stock Update Dialog */}
      <Dialog
        open={stockDialog.open}
        onOpenChange={(open) => {
          setStockDialog({ open });
          if (!open) {
            setStockInput({ strips: 0, action: "add" });
            setError(null);
            setImportProduct(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock: {stockDialog.product?.name}</DialogTitle>
            <DialogDescription>
              Current: {stockDialog.product?.strip_count} strips (
              {(stockDialog.product?.strip_count || 0) *
                (stockDialog.product?.per_strip_tablet_count || 0)}{" "}
              tablets)
            </DialogDescription>
          </DialogHeader>

          {loadingImport ? (
            <p className="text-sm text-gray-500">Loading import data...</p>
          ) : (
            <div className="space-y-4">
              {importProduct && stockInput.action === "add" && (
                <Alert>
                  <AlertDescription>
                    Available in Import: <strong>{importProduct.strip_count}</strong> strips
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>Action</Label>
                <div className="flex gap-2">
                  <Button
                    variant={stockInput.action === "add" ? "default" : "outline"}
                    onClick={() =>
                      setStockInput((prev) => ({ ...prev, action: "add" }))
                    }
                    className="flex-1"
                  >
                    Add Strips
                  </Button>
                  <Button
                    variant={stockInput.action === "remove" ? "default" : "outline"}
                    onClick={() =>
                      setStockInput((prev) => ({ ...prev, action: "remove" }))
                    }
                    className="flex-1"
                  >
                    Remove Strips
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="strips">Number of Strips</Label>
                <Input
                  id="strips"
                  type="number"
                  min="1"
                  value={stockInput.strips}
                  onChange={(e) =>
                    setStockInput((prev) => ({
                      ...prev,
                      strips: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="Enter strips"
                  className={!valid && stockInput.strips > 0 ? "border-red-500" : ""}
                />
                {!valid && stockInput.strips > 0 && (
                  <p className="text-sm text-red-600">{message}</p>
                )}
              </div>

              <div className="bg-gray-100 p-3 rounded">
                <p className="text-sm">
                  New Stock:{" "}
                  <span className="font-bold">
                    {stockInput.action === "add"
                      ? (stockDialog.product?.strip_count || 0) + stockInput.strips
                      : (stockDialog.product?.strip_count || 0) - stockInput.strips}{" "}
                    strips
                  </span>
                </p>
                <p className="text-sm">
                  Total Tablets:{" "}
                  <span className="font-bold">
                    {(stockInput.action === "add"
                      ? (stockDialog.product?.strip_count || 0) + stockInput.strips
                      : (stockDialog.product?.strip_count || 0) - stockInput.strips) *
                      (stockDialog.product?.per_strip_tablet_count || 0)}{" "}
                    tablets
                  </span>
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStockDialog({ open: false })}
                >
                  Cancel
                </Button>
                <Button onClick={handleStockUpdate} disabled={!valid || loadingImport}>
                  Update Stock
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
// "use client";

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Input } from "@/components/ui/input";
// import { Pencil, Trash2, Package } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// // import { supabase } from "@/lib/supabase"; // Adjust path as needed

// import { createClient } from "@/lib/supabase/client";
// interface Product {
//   id: string;
//   name: string;
//   sku: string;
//   brand_code?: string;
//   company_id?: string;
//   import_product_id?: string;
//   strip_count: number;
//   per_strip_tablet_count: number;
//   total_tablets?: number;
//   quantity: number;
//   cost_price: number;
//   selling_price: number;
//   unit_price: number;
//   category: string;
//   description: string;
//   company_name?: string;
// }

// interface ImportProduct {
//   id: string;
//   strip_count: number;
//   per_strip_tablet_count: number;
// }

// interface ProductInventoryTableProps {
//   products: Product[];
//   onEdit: (product: Product) => void;
//   onDelete: (id: string) => void;
//   onUpdateStock: (id: string, strips: number) => void;
// }

// export default function ProductInventoryTable({
//   products,
//   onEdit,
//   onDelete,
//   onUpdateStock,
// }: ProductInventoryTableProps) {
//   const [stockDialog, setStockDialog] = useState<{
//     open: boolean;
//     product?: Product;
//   }>({ open: false });

//   const [stockInput, setStockInput] = useState({
//     strips: 0,
//     action: "add" as "add" | "remove",
//   });

//   const [importProduct, setImportProduct] = useState<ImportProduct | null>(null);
//   const [loadingImport, setLoadingImport] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const supabase = createClient();
//   // Fetch import_product data when dialog opens
//   useEffect(() => {
//     if (stockDialog.open && stockDialog.product?.import_product_id) {
//       const fetchImportProduct = async () => {
//         setLoadingImport(true);
//         setError(null);
//         try {
//           const { data, error } = await supabase
//             .from("import_products")
//             .select("id, strip_count, per_strip_tablet_count")
//             .eq("id", stockDialog.product!.import_product_id)
//             .single();

//           if (error) throw error;
//           setImportProduct(data);
//         } catch (err: any) {
//           setError("Failed to load import data: " + err.message);
//           console.error(err);
//         } finally {
//           setLoadingImport(false);
//         }
//       };

//       fetchImportProduct();
//     } else {
//       setImportProduct(null);
//     }
//   }, [stockDialog.open, stockDialog.product?.import_product_id]);

//   // Validation logic
//   const validateInput = () => {
//     const currentStrips = stockDialog.product?.strip_count || 0;
//     const inputStrips = stockInput.strips;

//     if (inputStrips <= 0) return { valid: false, message: "Enter a valid number of strips." };

//     if (stockInput.action === "add") {
//       const availableInImport = importProduct?.strip_count || 0;
//       if (inputStrips > availableInImport) {
//         return {
//           valid: false,
//           message: `Only ${availableInImport} strips available in import catalog.`,
//         };
//       }
//     }

//     if (stockInput.action === "remove") {
//       if (inputStrips > currentStrips) {
//         return {
//           valid: false,
//           message: `Cannot remove ${inputStrips} strips. Only ${currentStrips} available.`,
//         };
//       }
//     }

//     return { valid: true, message: "" };
//   };

//   const { valid, message } = validateInput();

//   const handleStockUpdate = async () => {
//     if (!stockDialog.product || !valid) return;

//     const currentStrips = stockDialog.product.strip_count;
//     const newStrips =
//       stockInput.action === "add"
//         ? currentStrips + stockInput.strips
//         : currentStrips - stockInput.strips;

//     try {
//       // 1. Update import_products (only on "add")
//       if (stockInput.action === "add" && importProduct) {
//         const remainingInImport = importProduct.strip_count - stockInput.strips;
//         if (remainingInImport < 0) throw new Error("Not enough in import");

//         const { error } = await supabase
//           .from("import_products")
//           .update({ strip_count: remainingInImport })
//           .eq("id", importProduct.id);

//         if (error) throw error;
//       }

//       // 2. Update product stock
//       onUpdateStock(stockDialog.product.id, newStrips);

//       // 3. Close dialog
//       setStockDialog({ open: false });
//       setStockInput({ strips: 0, action: "add" });
//       setImportProduct(null);
//     } catch (err: any) {
//       setError("Update failed: " + err.message);
//     }
//   };

//   const handleUpdateImportProduct = async () => {
//     // This is just a placeholder — you can call it from parent if needed
//     // Or expose via props
//   };

//   if (products.length === 0) {
//     return (
//       <div className="text-center py-12 text-gray-500">
//         No products in inventory. Add products from import catalog.
//       </div>
//     );
//   }

//   const calculateProfitMargin = (cost: number, selling: number) => {
//     if (cost === 0) return 0;
//     return (((selling - cost) / cost) * 100).toFixed(1);
//   };

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
//               <TableHead className="text-right">Strips</TableHead>
//               <TableHead className="text-right">Per Strip</TableHead>
//               <TableHead className="text-right">Total Tablets</TableHead>
//               <TableHead className="text-right">Cost Price</TableHead>
//               <TableHead className="text-right">Selling Price</TableHead>
//               <TableHead className="text-right">Profit %</TableHead>
//               <TableHead className="text-right">Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {products.map((product) => {
//               const totalTablets =
//                 product.total_tablets ||
//                 product.strip_count * product.per_strip_tablet_count;
//               const profitMargin = calculateProfitMargin(
//                 product.cost_price,
//                 product.selling_price
//               );
//               const isLowStock = totalTablets < 50;

//               return (
//                 <TableRow
//                   key={product.id}
//                   className={isLowStock ? "bg-red-50" : ""}
//                 >
//                   <TableCell className="font-medium">
//                     <div>
//                       {product.name}
//                       {isLowStock && (
//                         <span className="ml-2 text-xs px-2 py-1 bg-red-200 text-red-800 rounded">
//                           Low Stock
//                         </span>
//                       )}
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     {product.brand_code ? (
//                       <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm font-mono">
//                         {product.brand_code}
//                       </span>
//                     ) : (
//                       "-"
//                     )}
//                   </TableCell>
//                   <TableCell>{product.company_name || "-"}</TableCell>
//                   <TableCell>
//                     <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
//                       {product.category}
//                     </span>
//                   </TableCell>
//                   <TableCell className="text-right font-semibold">
//                     {product.strip_count}
//                   </TableCell>
//                   <TableCell className="text-right">
//                     {product.per_strip_tablet_count}
//                   </TableCell>
//                   <TableCell className="text-right font-bold text-lg">
//                     {totalTablets}
//                   </TableCell>
//                   <TableCell className="text-right">
//                     ₹{product.cost_price?.toFixed(2)}
//                   </TableCell>
//                   <TableCell className="text-right">
//                     ₹{product.selling_price?.toFixed(2)}
//                   </TableCell>
//                   <TableCell className="text-right">
//                     <span
//                       className={`px-2 py-1 rounded text-sm ${
//                         parseFloat(profitMargin) > 20
//                           ? "bg-green-100 text-green-800"
//                           : "bg-yellow-100 text-yellow-800"
//                       }`}
//                     >
//                       {profitMargin}%
//                     </span>
//                   </TableCell>
//                   <TableCell className="text-right">
//                     <div className="flex justify-end gap-2">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => {
//                           setStockDialog({ open: true, product });
//                           setStockInput({ strips: 0, action: "add" });
//                           setError(null);
//                         }}
//                       >
//                         <Package className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => onEdit(product)}
//                       >
//                         <Pencil className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant="destructive"
//                         size="sm"
//                         onClick={() => {
//                           if (
//                             confirm(
//                               `Delete ${product.name}? This action cannot be undone.`
//                             )
//                           ) {
//                             onDelete(product.id);
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

//       {/* Stock Update Dialog */}
//       <Dialog
//         open={stockDialog.open}
//         onOpenChange={(open) => {
//           setStockDialog({ open });
//           if (!open) {
//             setStockInput({ strips: 0, action: "add" });
//             setError(null);
//             setImportProduct(null);
//           }
//         }}
//       >
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Update Stock: {stockDialog.product?.name}</DialogTitle>
//             <DialogDescription>
//               Current: {stockDialog.product?.strip_count} strips (
//               {(stockDialog.product?.strip_count || 0) *
//                 (stockDialog.product?.per_strip_tablet_count || 0)}{" "}
//               tablets)
//             </DialogDescription>
//           </DialogHeader>

//           {loadingImport ? (
//             <p className="text-sm text-gray-500">Loading import data...</p>
//           ) : (
//             <div className="space-y-4">
//               {importProduct && stockInput.action === "add" && (
//                 <Alert>
//                   <AlertDescription>
//                     Available in Import: <strong>{importProduct.strip_count}</strong> strips
//                   </AlertDescription>
//                 </Alert>
//               )}

//               {error && (
//                 <Alert variant="destructive">
//                   <AlertDescription>{error}</AlertDescription>
//                 </Alert>
//               )}

//               <div className="space-y-2">
//                 <Label>Action</Label>
//                 <div className="flex gap-2">
//                   <Button
//                     variant={stockInput.action === "add" ? "default" : "outline"}
//                     onClick={() =>
//                       setStockInput((prev) => ({ ...prev, action: "add" }))
//                     }
//                     className="flex-1"
//                   >
//                     Add Strips
//                   </Button>
//                   <Button
//                     variant={stockInput.action === "remove" ? "default" : "outline"}
//                     onClick={() =>
//                       setStockInput((prev) => ({ ...prev, action: "remove" }))
//                     }
//                     className="flex-1"
//                   >
//                     Remove Strips
//                   </Button>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="strips">Number of Strips</Label>
//                 <Input
//                   id="strips"
//                   type="number"
//                   min="1"
//                   value={stockInput.strips}
//                   onChange={(e) =>
//                     setStockInput((prev) => ({
//                       ...prev,
//                       strips: parseInt(e.target.value) || 0,
//                     }))
//                   }
//                   placeholder="Enter strips"
//                   className={!valid && stockInput.strips > 0 ? "border-red-500" : ""}
//                 />
//                 {!valid && stockInput.strips > 0 && (
//                   <p className="text-sm text-red-600">{message}</p>
//                 )}
//               </div>

//               <div className="bg-gray-100 p-3 rounded">
//                 <p className="text-sm">
//                   New Stock:{" "}
//                   <span className="font-bold">
//                     {stockInput.action === "add"
//                       ? (stockDialog.product?.strip_count || 0) + stockInput.strips
//                       : (stockDialog.product?.strip_count || 0) - stockInput.strips}{" "}
//                     strips
//                   </span>
//                 </p>
//                 <p className="text-sm">
//                   Total Tablets:{" "}
//                   <span className="font-bold">
//                     {(stockInput.action === "add"
//                       ? (stockDialog.product?.strip_count || 0) + stockInput.strips
//                       : (stockDialog.product?.strip_count || 0) - stockInput.strips) *
//                       (stockDialog.product?.per_strip_tablet_count || 0)}{" "}
//                     tablets
//                   </span>
//                 </p>
//               </div>

//               <div className="flex justify-end gap-2">
//                 <Button
//                   variant="outline"
//                   onClick={() => setStockDialog({ open: false })}
//                 >
//                   Cancel
//                 </Button>
//                 <Button onClick={handleStockUpdate} disabled={!valid || loadingImport}>
//                   Update Stock
//                 </Button>
//               </div>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }
// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Input } from "@/components/ui/input";
// import { Pencil, Trash2, Package } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";

// interface Product {
//   id: string;
//   name: string;
//   sku: string;
//   brand_code?: string;
//   company_id?: string;
//   import_product_id?: string;
//   strip_count: number;
//   per_strip_tablet_count: number;
//   total_tablets?: number;
//   quantity: number;
//   cost_price: number;
//   selling_price: number;
//   unit_price: number;
//   category: string;
//   description: string;
//   company_name?: string;
// }

// interface ProductInventoryTableProps {
//   products: Product[];
//   onEdit: (product: Product) => void;
//   onDelete: (id: string) => void;
//   onUpdateStock: (id: string, strips: number) => void;
// }


// export default function ProductInventoryTable({
//   products,
//   onEdit,
//   onDelete,
//   onUpdateStock,
// }: ProductInventoryTableProps) {
//   const [stockDialog, setStockDialog] = useState<{
//     open: boolean;
//     product?: Product;
//   }>({ open: false });
//   const [stockInput, setStockInput] = useState({
//     strips: 0,
//     action: "add", // 'add' or 'remove'
//   });

//   const handleStockUpdate = () => {
//     if (!stockDialog.product) return;

//     const currentStrips = stockDialog.product.strip_count;
//     const newStrips =
//       stockInput.action === "add"
//         ? currentStrips + stockInput.strips
//         : currentStrips - stockInput.strips;

//     if (newStrips < 0) {
//       alert("Cannot remove more strips than available!");
//       return;
//     }

//     onUpdateStock(stockDialog.product.id, newStrips);
//     setStockDialog({ open: false });
//     setStockInput({ strips: 0, action: "add" });
//   };

//   if (products.length === 0) {
//     return (
//       <div className="text-center py-12 text-gray-500">
//         No products in inventory. Add products from import catalog.
//       </div>
//     );
//   }

//   const calculateProfitMargin = (cost: number, selling: number) => {
//     if (cost === 0) return 0;
//     return (((selling - cost) / cost) * 100).toFixed(1);
//   };

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
//               <TableHead className="text-right">Strips</TableHead>
//               <TableHead className="text-right">Per Strip</TableHead>
//               <TableHead className="text-right">Total Tablets</TableHead>
//               <TableHead className="text-right">Cost Price</TableHead>
//               <TableHead className="text-right">Selling Price</TableHead>
//               <TableHead className="text-right">Profit %</TableHead>
//               <TableHead className="text-right">Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {products.map((product) => {
//               const totalTablets =
//                 product.total_tablets ||
//                 product.strip_count * product.per_strip_tablet_count;
//               const profitMargin = calculateProfitMargin(
//                 product.cost_price,
//                 product.selling_price
//               );
//               const isLowStock = totalTablets < 50;

//               return (
//                 <TableRow
//                   key={product.id}
//                   className={isLowStock ? "bg-red-50" : ""}
//                 >
//                   <TableCell className="font-medium">
//                     <div>
//                       {product.name}
//                       {isLowStock && (
//                         <span className="ml-2 text-xs px-2 py-1 bg-red-200 text-red-800 rounded">
//                           Low Stock
//                         </span>
//                       )}
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     {product.brand_code ? (
//                       <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm font-mono">
//                         {product.brand_code}
//                       </span>
//                     ) : (
//                       "-"
//                     )}
//                   </TableCell>
//                   <TableCell>{product.company_name || "-"}</TableCell>
//                   <TableCell>
//                     <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
//                       {product.category}
//                     </span>
//                   </TableCell>
//                   <TableCell className="text-right font-semibold">
//                     {product.strip_count}
//                   </TableCell>
//                   <TableCell className="text-right">
//                     {product.per_strip_tablet_count}
//                   </TableCell>
//                   <TableCell className="text-right font-bold text-lg">
//                     {totalTablets}
//                   </TableCell>
//                   <TableCell className="text-right">
//                     ₹{product.cost_price?.toFixed(2)}
//                   </TableCell>
//                   <TableCell className="text-right">
//                     ₹{product.selling_price?.toFixed(2)}
//                   </TableCell>
//                   <TableCell className="text-right">
//                     <span
//                       className={`px-2 py-1 rounded text-sm ${
//                         parseFloat(profitMargin) > 20
//                           ? "bg-green-100 text-green-800"
//                           : "bg-yellow-100 text-yellow-800"
//                       }`}
//                     >
//                       {profitMargin}%
//                     </span>
//                   </TableCell>
//                   <TableCell className="text-right">
//                     <div className="flex justify-end gap-2">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => {
//                           setStockDialog({ open: true, product });
//                           setStockInput({ strips: 0, action: "add" });
//                         }}
//                       >
//                         <Package className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => onEdit(product)}
//                       >
//                         <Pencil className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant="destructive"
//                         size="sm"
//                         onClick={() => {
//                           if (
//                             confirm(
//                               `Delete ${product.name}? This action cannot be undone.`
//                             )
//                           ) {
//                             onDelete(product.id);
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

//       {/* Stock Update Dialog */}
//       <Dialog
//         open={stockDialog.open}
//         onOpenChange={(open) => setStockDialog({ open })}
//       >
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Update Stock: {stockDialog.product?.name}</DialogTitle>
//             <DialogDescription>
//               Current: {stockDialog.product?.strip_count} strips (
//               {(stockDialog.product?.strip_count || 0) *
//                 (stockDialog.product?.per_strip_tablet_count || 0)}{" "}
//               tablets)
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div className="space-y-2">
//               <Label>Action</Label>
//               <div className="flex gap-2">
//                 <Button
//                   variant={stockInput.action === "add" ? "default" : "outline"}
//                   onClick={() =>
//                     setStockInput((prev) => ({ ...prev, action: "add" }))
//                   }
//                   className="flex-1"
//                 >
//                   Add Strips
//                 </Button>
//                 <Button
//                   variant={
//                     stockInput.action === "remove" ? "default" : "outline"
//                   }
//                   onClick={() =>
//                     setStockInput((prev) => ({ ...prev, action: "remove" }))
//                   }
//                   className="flex-1"
//                 >
//                   Remove Strips
//                 </Button>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="strips">Number of Strips</Label>
//               <Input
//                 id="strips"
//                 type="number"
//                 min="0"
//                 value={stockInput.strips}
//                 onChange={(e) =>
//                   setStockInput((prev) => ({
//                     ...prev,
//                     strips: parseInt(e.target.value) || 0,
//                   }))
//                 }
//                 placeholder="Enter strips"
//               />
//             </div>

//             <div className="bg-gray-100 p-3 rounded">
//               <p className="text-sm">
//                 New Stock:{" "}
//                 <span className="font-bold">
//                   {stockInput.action === "add"
//                     ? (stockDialog.product?.strip_count || 0) +
//                       stockInput.strips
//                     : (stockDialog.product?.strip_count || 0) -
//                       stockInput.strips}{" "}
//                   strips
//                 </span>
//               </p>
//               <p className="text-sm">
//                 Total Tablets:{" "}
//                 <span className="font-bold">
//                   {(stockInput.action === "add"
//                     ? (stockDialog.product?.strip_count || 0) +
//                       stockInput.strips
//                     : (stockDialog.product?.strip_count || 0) -
//                       stockInput.strips) *
//                     (stockDialog.product?.per_strip_tablet_count || 0)}{" "}
//                   tablets
//                 </span>
//               </p>
//             </div>

//             <div className="flex justify-end gap-2">
//               <Button
//                 variant="outline"
//                 onClick={() => setStockDialog({ open: false })}
//               >
//                 Cancel
//               </Button>
//               <Button onClick={handleStockUpdate}>Update Stock</Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }
