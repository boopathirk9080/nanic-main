// "use client";

// import { useEffect, useState } from "react";
// import { createClient } from "@/lib/supabase/client";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Plus, Building2, Package, Archive } from "lucide-react";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import CompanyForm from "./CompanyForm";
// import CompanyTableRows from "./CompanyTableRows";
// import ImportProductForm from "./ImportProductForm";
// import ImportProductTable from "./import-product-table";
// import ProductInventoryTable from "./product-inventory-table";

// interface Company {
//   id: string;
//   company_name: string;
//   company_code: string;
//   contact_person?: string;
//   contact_email?: string;
//   contact_phone?: string;
//   address?: string;
// }

// interface ImportProduct {
//   id: string;
//   company_id: string;
//   brand_code: string;
//   product_name: string;
//   category: string;
//   strip_count: number;
//   per_strip_tablet_count: number;
//   import_price: number;
//   companies?: Company;
// }

// interface Product {
//   id: string;
//   name: string;
//   sku: string;
//   brand_code?: string;
//   company_id?: string;
//   import_product_id?: string;
//   strip_count: number;
//   per_strip_tablet_count: number;
//   cost_price: number;
//   selling_price: number;
//   category: string;
//   company_name?: string;
// }

// export default function ProductsPage() {
//   const [activeTab, setActiveTab] = useState("inventory");
//   const [products, setProducts] = useState<Product[]>([]);
//   const [companies, setCompanies] = useState<Company[]>([]);
//   const [importProducts, setImportProducts] = useState<ImportProduct[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [userId, setUserId] = useState<string | null>(null);

//   // Form states
//   const [showCompanyForm, setShowCompanyForm] = useState(false);
//   const [editingCompany, setEditingCompany] = useState<Company | null>(null);
//   const [showImportForm, setShowImportForm] = useState(false);
//   const [editingImportProduct, setEditingImportProduct] =
//     useState<ImportProduct | null>(null);

//   const supabase = createClient();

//   useEffect(() => {
//     const getUser = async () => {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       setUserId(user?.id || null);
//     };
//     getUser();
//     fetchAllData();
//   }, []);

//   const fetchAllData = async () => {
//     setIsLoading(true);
//     await Promise.all([
//       fetchProducts(),
//       fetchCompanies(),
//       fetchImportProducts(),
//     ]);
//     setIsLoading(false);
//   };

//   // Companies CRUD
//   const fetchCompanies = async () => {
//     try {
//       const { data, error } = await supabase
//         .from("companies")
//         .select("*")
//         .order("company_name");

//       if (error) throw error;
//       setCompanies(data || []);
//     } catch (error) {
//       console.error("Error fetching companies:", error);
//     }
//   };

//   const handleAddCompany = async (companyData: Omit<Company, "id">) => {
//     try {
//       const { error } = await supabase.from("companies").insert([
//         {
//           ...companyData,
//           user_id: userId,
//         },
//       ]);

//       if (error) throw error;
//       await fetchCompanies();
//       setShowCompanyForm(false);
//       alert("Company added successfully!");
//     } catch (error: any) {
//       console.error("Error adding company:", error);
//       alert(`Error: ${error.message}`);
//     }
//   };

//   const handleUpdateCompany = async (companyData: Omit<Company, "id">) => {
//     if (!editingCompany) return;

//     try {
//       const { error } = await supabase
//         .from("companies")
//         .update(companyData)
//         .eq("id", editingCompany.id);

//       if (error) throw error;
//       await fetchCompanies();
//       setEditingCompany(null);
//       setShowCompanyForm(false);
//       alert("Company updated successfully!");
//     } catch (error: any) {
//       console.error("Error updating company:", error);
//       alert(`Error: ${error.message}`);
//     }
//   };

//   const handleDeleteCompany = async (id: string) => {
//     try {
//       const { error } = await supabase.from("companies").delete().eq("id", id);

//       if (error) throw error;
//       await fetchCompanies();
//       await fetchImportProducts();
//       alert("Company deleted successfully!");
//     } catch (error: any) {
//       console.error("Error deleting company:", error);
//       alert(`Error: ${error.message}`);
//     }
//   };

//   // Import Products CRUD
//   const fetchImportProducts = async () => {
//     try {
//       const { data, error } = await supabase
//         .from("import_products")
//         .select(
//           `
//           *,
//           companies (
//             company_name,
//             company_code
//           )
//         `
//         )
//         .order("product_name");

//       if (error) throw error;
//       setImportProducts(data || []);
//     } catch (error) {
//       console.error("Error fetching import products:", error);
//     }
//   };

//   const handleAddImportProduct = async (
//     productData: Omit<ImportProduct, "id">
//   ) => {
//     try {
//       const { error } = await supabase.from("import_products").insert([
//         {
//           ...productData,
//           user_id: userId,
//         },
//       ]);

//       if (error) throw error;
//       await fetchImportProducts();
//       setShowImportForm(false);
//       alert("Import product added successfully!");
//     } catch (error: any) {
//       console.error("Error adding import product:", error);
//       alert(`Error: ${error.message}`);
//     }
//   };

//   const handleUpdateImportProduct = async (
//     productData: Omit<ImportProduct, "id">
//   ) => {
//     if (!editingImportProduct) return;

//     try {
//       const { error } = await supabase
//         .from("import_products")
//         .update(productData)
//         .eq("id", editingImportProduct.id);

//       if (error) throw error;
//       await fetchImportProducts();
//       setEditingImportProduct(null);
//       setShowImportForm(false);
//       alert("Import product updated successfully!");
//     } catch (error: any) {
//       console.error("Error updating import product:", error);
//       alert(`Error: ${error.message}`);
//     }
//   };

//   const handleDeleteImportProduct = async (id: string) => {
//     try {
//       const { error } = await supabase
//         .from("import_products")
//         .delete()
//         .eq("id", id);

//       if (error) throw error;
//       await fetchImportProducts();
//       alert("Import product deleted successfully!");
//     } catch (error: any) {
//       console.error("Error deleting import product:", error);
//       alert(`Error: ${error.message}`);
//     }
//   };

//   // const handleAddToInventory = async (
//   //   importProduct: ImportProduct,
//   //   strips: number
//   // ) => {
//   //   try {
//   //     // Check if product already exists in inventory
//   //     const { data: existing } = await supabase
//   //       .from("products")
//   //       .select("*")
//   //       .eq("import_product_id", importProduct.id)
//   //       .single();

//   //     if (existing) {
//   //       // Update existing product by adding strips
//   //       const newStripCount = existing.strip_count + strips;
//   //       const { error } = await supabase
//   //         .from("products")
//   //         .update({
//   //           strip_count: newStripCount,
//   //           updated_at: new Date().toISOString(),
//   //         })
//   //         .eq("id", existing.id);

//   //       if (error) throw error;
//   //       alert(`Added ${strips} strips to existing product!`);
//   //     } else {
//   //       // Create new product in inventory
//   //       const newProduct = {
//   //         user_id: userId,
//   //         company_id: importProduct.company_id,
//   //         import_product_id: importProduct.id,
//   //         name: importProduct.product_name,
//   //         brand_code: importProduct.brand_code,
//   //         sku: importProduct.brand_code,
//   //         category: importProduct.category,
//   //         strip_count: strips,
//   //         per_strip_tablet_count: importProduct.per_strip_tablet_count,
//   //         cost_price: importProduct.import_price,
//   //         selling_price: importProduct.import_price * 1.3, // 30% markup
//   //       };

//   //       const { error } = await supabase.from("products").insert([newProduct]);
//   //       if (error) throw error;
//   //       alert("Product added to inventory successfully!");
//   //     }

//   //     await fetchProducts();
//   //     setActiveTab("inventory");
//   //   } catch (error: any) {
//   //     console.error("Error adding to inventory:", error);
//   //     alert(`Error: ${error.message}`);
//   //   }
//   // };

//   // Products CRUD

//   const handleAddToInventory = async (
//     importProduct: ImportProduct,
//     strips: number
//   ) => {
//     try {
//       // Check if product already exists in inventory
//       const { data: existing } = await supabase
//         .from("products")
//         .select("*")
//         .eq("import_product_id", importProduct.id)
//         .single();

//       if (existing) {
//         // Update existing product by adding strips
//         const newStripCount = existing.strip_count + strips;
//         const { error } = await supabase
//           .from("products")
//           .update({
//             strip_count: newStripCount,
//             updated_at: new Date().toISOString(),
//           })
//           .eq("id", existing.id);

//         if (error) throw error;
//       } else {
//         // Create new product in inventory
//         const newProduct = {
//           user_id: userId,
//           company_id: importProduct.company_id,
//           import_product_id: importProduct.id,
//           name: importProduct.product_name,
//           brand_code: importProduct.brand_code,
//           sku: importProduct.brand_code,
//           category: importProduct.category,
//           strip_count: strips,
//           per_strip_tablet_count: importProduct.per_strip_tablet_count,
//           cost_price: importProduct.import_price,
//           selling_price: importProduct.import_price * 1.3, // 30% markup
//         };

//         const { error } = await supabase.from("products").insert([newProduct]);
//         if (error) throw error;
//       }

//       // ✨ REDUCE THE STRIP COUNT IN IMPORT_PRODUCTS TABLE
//       const newImportStripCount = importProduct.strip_count - strips;
//       const { error: updateError } = await supabase
//         .from("import_products")
//         .update({
//           strip_count: newImportStripCount,
//           updated_at: new Date().toISOString(),
//         })
//         .eq("id", importProduct.id);

//       if (updateError) throw updateError;

//       await fetchProducts();
//       await fetchImportProducts(); // Refresh to show updated count
//       setActiveTab("inventory");
//       alert(`Added ${strips} strips to inventory successfully!`);
//     } catch (error: any) {
//       console.error("Error adding to inventory:", error);
//       alert(`Error: ${error.message}`);
//     }
//   };

//   const fetchProducts = async () => {
//     try {
//       const { data, error } = await supabase
//         .from("products")
//         .select(
//           `
//           *,
//           companies:company_id (
//             company_name,
//             company_code
//           )
//         `
//         )
//         .order("created_at", { ascending: false });

//       if (error) throw error;

//       const formattedData =
//         data?.map((p) => ({
//           ...p,
//           company_name: p.companies?.company_name,
//         })) || [];

//       setProducts(formattedData);
//     } catch (error) {
//       console.error("Error fetching products:", error);
//     }
//   };

//   const handleUpdateStock = async (id: string, newStripCount: number) => {
//     try {
//       const { error } = await supabase
//         .from("products")
//         .update({
//           strip_count: newStripCount,
//           updated_at: new Date().toISOString(),
//         })
//         .eq("id", id);

//       if (error) throw error;
//       await fetchProducts();
//       alert("Stock updated successfully!");
//     } catch (error: any) {
//       console.error("Error updating stock:", error);
//       alert(`Error: ${error.message}`);
//     }
//   };

//   const handleDeleteProduct = async (id: string) => {
//     try {
//       const { error } = await supabase.from("products").delete().eq("id", id);

//       if (error) throw error;
//       await fetchProducts();
//       alert("Product deleted successfully!");
//     } catch (error: any) {
//       console.error("Error deleting product:", error);
//       alert(`Error: ${error.message}`);
//     }
//   };

//   // Filters
//   const filteredProducts = products.filter(
//     (product) =>
//       product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       product.brand_code?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const filteredImportProducts = importProducts.filter(
//     (product) =>
//       product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       product.brand_code.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="p-6 space-y-6">
//       <Tabs value={activeTab} onValueChange={setActiveTab}>
//         <TabsList className="grid w-full grid-cols-3">
//           <TabsTrigger value="inventory">
//             <Archive className="w-4 h-4 mr-2" />
//             Current Inventory ({products.length})
//           </TabsTrigger>
//           <TabsTrigger value="import">
//             <Package className="w-4 h-4 mr-2" />
//             Import Products ({importProducts.length})
//           </TabsTrigger>
//           <TabsTrigger value="companies">
//             <Building2 className="w-4 h-4 mr-2" />
//             Companies ({companies.length})
//           </TabsTrigger>
//         </TabsList>

//         {/* Current Inventory Tab */}
//         <TabsContent value="inventory" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Current Inventory</CardTitle>
//               <CardDescription>
//                 Manage your medical product stock levels
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="mb-4">
//                 <Input
//                   placeholder="Search by name, SKU, or brand code..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="max-w-sm"
//                 />
//               </div>

//               {isLoading ? (
//                 <div className="text-center py-8">Loading inventory...</div>
//               ) : (
//                 <ProductInventoryTable
//                   products={filteredProducts}
//                   onEdit={(product) => {
//                     console.log("Edit product:", product);
//                   }}
//                   onDelete={handleDeleteProduct}
//                   onUpdateStock={handleUpdateStock}
//                 />
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Import Products Tab */}
//         <TabsContent value="import" className="space-y-4">
//           {showImportForm && (
//             <Card>
//               <CardHeader>
//                 <CardTitle>
//                   {editingImportProduct
//                     ? "Edit Import Product"
//                     : "Add Import Product"}
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <ImportProductForm
//                   companies={companies}
//                   importProduct={editingImportProduct || undefined}
//                   onSubmit={
//                     editingImportProduct
//                       ? handleUpdateImportProduct
//                       : handleAddImportProduct
//                   }
//                   onCancel={() => {
//                     setShowImportForm(false);
//                     setEditingImportProduct(null);
//                   }}
//                 />
//               </CardContent>
//             </Card>
//           )}

//           <Card>
//             <CardHeader>
//               <div className="flex justify-between items-center">
//                 <div>
//                   <CardTitle>Import Products Catalog</CardTitle>
//                   <CardDescription>
//                     Master product list from companies
//                   </CardDescription>
//                 </div>
//                 <Button onClick={() => setShowImportForm(true)}>
//                   <Plus className="w-4 h-4 mr-2" />
//                   Add Import Product
//                 </Button>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="mb-4">
//                 <Input
//                   placeholder="Search import products..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="max-w-sm"
//                 />
//               </div>

//               {isLoading ? (
//                 <div className="text-center py-8">
//                   Loading import products...
//                 </div>
//               ) : (
//                 <ImportProductTable
//                   importProducts={filteredImportProducts}
//                   onEdit={(product) => {
//                     setEditingImportProduct(product);
//                     setShowImportForm(true);
//                   }}
//                   onDelete={handleDeleteImportProduct}
//                   onAddToInventory={handleAddToInventory}
//                 />
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Companies Tab */}
//         <TabsContent value="companies" className="space-y-4">
//           {showCompanyForm && (
//             <Card>
//               <CardHeader>
//                 <CardTitle>
//                   {editingCompany ? "Edit Company" : "Add Company"}
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <CompanyForm
//                   company={editingCompany || undefined}
//                   onSubmit={
//                     editingCompany ? handleUpdateCompany : handleAddCompany
//                   }
//                   onCancel={() => {
//                     setShowCompanyForm(false);
//                     setEditingCompany(null);
//                   }}
//                 />
//               </CardContent>
//             </Card>
//           )}

//           <Card>
//             <CardHeader>
//               <div className="flex justify-between items-center">
//                 <div>
//                   <CardTitle>Companies</CardTitle>
//                   <CardDescription>
//                     Manage pharmaceutical suppliers
//                   </CardDescription>
//                 </div>
//                 <Button onClick={() => setShowCompanyForm(true)}>
//                   <Plus className="w-4 h-4 mr-2" />
//                   Add Company
//                 </Button>
//               </div>
//             </CardHeader>
//             <CardContent>
//               {isLoading ? (
//                 <div className="text-center py-8">Loading companies...</div>
//               ) : (
//                 <CompanyTableRows
//                   companies={companies}
//                   onEdit={(company) => {
//                     setEditingCompany(company);
//                     setShowCompanyForm(true);
//                   }}
//                   onDelete={handleDeleteCompany}
//                 />
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Building2, Package, Archive } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanyForm from "./CompanyForm";
import CompanyTableRows from "./CompanyTableRows";
import ImportProductForm from "./ImportProductForm";
import ImportProductTable from "./import-product-table";
import ProductInventoryTable from "./product-inventory-table";

interface Company {
  id: string;
  company_name: string;
  company_code: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
}

interface ImportProduct {
  id: string;
  company_id: string;
  brand_code: string;
  product_name: string;
  category: string;
  strip_count: number;
  per_strip_tablet_count: number;
  import_price: number;
  companies?: Company;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  brand_code?: string;
  company_id?: string;
  import_product_id?: string;
  strip_count: number;
  per_strip_tablet_count: number;
  cost_price: number;
  selling_price: number;
  category: string;
  company_name?: string;
}

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [products, setProducts] = useState<Product[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [importProducts, setImportProducts] = useState<ImportProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  // Form states
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [showImportForm, setShowImportForm] = useState(false);
  const [editingImportProduct, setEditingImportProduct] =
    useState<ImportProduct | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchProducts(),
      fetchCompanies(),
      fetchImportProducts(),
    ]);
    setIsLoading(false);
  };

  // Companies CRUD
  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("company_name");

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const handleAddCompany = async (companyData: Omit<Company, "id">) => {
    try {
      const { error } = await supabase.from("companies").insert([
        {
          ...companyData,
          user_id: userId,
        },
      ]);

      if (error) throw error;
      await fetchCompanies();
      setShowCompanyForm(false);
      alert("Company added successfully!");
    } catch (error: any) {
      console.error("Error adding company:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleUpdateCompany = async (companyData: Omit<Company, "id">) => {
    if (!editingCompany) return;

    try {
      const { error } = await supabase
        .from("companies")
        .update(companyData)
        .eq("id", editingCompany.id);

      if (error) throw error;
      await fetchCompanies();
      setEditingCompany(null);
      setShowCompanyForm(false);
      alert("Company updated successfully!");
    } catch (error: any) {
      console.error("Error updating company:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteCompany = async (id: string) => {
    try {
      const { error } = await supabase.from("companies").delete().eq("id", id);

      if (error) throw error;
      await fetchCompanies();
      await fetchImportProducts();
      alert("Company deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting company:", error);
      alert(`Error: ${error.message}`);
    }
  };

  // Import Products CRUD
  const fetchImportProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("import_products")
        .select(
          `
          *,
          companies (
            company_name,
            company_code
          )
        `
        )
        .order("product_name");

      if (error) throw error;
      setImportProducts(data || []);
    } catch (error) {
      console.error("Error fetching import products:", error);
    }
  };

  const handleAddImportProduct = async (
    productData: Omit<ImportProduct, "id">
  ) => {
    try {
      const { error } = await supabase.from("import_products").insert([
        {
          ...productData,
          user_id: userId,
        },
      ]);

      if (error) throw error;
      await fetchImportProducts();
      setShowImportForm(false);
      alert("Import product added successfully!");
    } catch (error: any) {
      console.error("Error adding import product:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleUpdateImportProduct = async (
    productData: Omit<ImportProduct, "id">
  ) => {
    if (!editingImportProduct) return;

    try {
      const { error } = await supabase
        .from("import_products")
        .update(productData)
        .eq("id", editingImportProduct.id);

      if (error) throw error;
      await fetchImportProducts();
      setEditingImportProduct(null);
      setShowImportForm(false);
      alert("Import product updated successfully!");
    } catch (error: any) {
      console.error("Error updating import product:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteImportProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from("import_products")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchImportProducts();
      alert("Import product deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting import product:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleAddToInventory = async (
    importProduct: ImportProduct,
    strips: number
  ) => {
    try {
      // Check if product already exists in inventory
      const { data: existing } = await supabase
        .from("products")
        .select("*")
        .eq("import_product_id", importProduct.id)
        .single();

      if (existing) {
        // Update existing product by adding strips
        const newStripCount = existing.strip_count + strips;
        const { error } = await supabase
          .from("products")
          .update({
            strip_count: newStripCount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Create new product in inventory
        const newProduct = {
          user_id: userId,
          company_id: importProduct.company_id,
          import_product_id: importProduct.id,
          name: importProduct.product_name,
          brand_code: importProduct.brand_code,
          sku: importProduct.brand_code,
          category: importProduct.category,
          strip_count: strips,
          per_strip_tablet_count: importProduct.per_strip_tablet_count,
          cost_price: importProduct.import_price,
          selling_price: importProduct.import_price * 1.3, // 30% markup
        };

        const { error } = await supabase.from("products").insert([newProduct]);
        if (error) throw error;
      }

      // ✨ REDUCE THE STRIP COUNT IN IMPORT_PRODUCTS TABLE
      const newImportStripCount = importProduct.strip_count - strips;
      const { error: updateError } = await supabase
        .from("import_products")
        .update({
          strip_count: newImportStripCount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", importProduct.id);

      if (updateError) throw updateError;

      await fetchProducts();
      await fetchImportProducts(); // Refresh to show updated count
      setActiveTab("inventory");
      alert(`Added ${strips} strips to inventory successfully!`);
    } catch (error: any) {
      console.error("Error adding to inventory:", error);
      alert(`Error: ${error.message}`);
    }
  };

  // Products CRUD
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          companies:company_id (
            company_name,
            company_code
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedData =
        data?.map((p) => ({
          ...p,
          company_name: p.companies?.company_name,
        })) || [];

      setProducts(formattedData);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleUpdateStock = async (id: string, newStripCount: number) => {
    try {
      // Get the current product to find old strip count and import_product_id
      const { data: currentProduct, error: fetchError } = await supabase
        .from("products")
        .select("strip_count, import_product_id")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const oldStripCount = currentProduct.strip_count;
      const stripDifference = newStripCount - oldStripCount;

      // Update the product strip count
      const { error } = await supabase
        .from("products")
        .update({
          strip_count: newStripCount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // ✨ UPDATE THE IMPORT_PRODUCTS TABLE IF LINKED
      if (currentProduct.import_product_id) {
        // Get the current import product strip count
        const { data: importProduct, error: importFetchError } = await supabase
          .from("import_products")
          .select("strip_count")
          .eq("id", currentProduct.import_product_id)
          .single();

        if (importFetchError) throw importFetchError;

        // Calculate new import strip count (inverse of inventory change)
        // If inventory increases (+10), import decreases (-10)
        // If inventory decreases (-5), import increases (+5)
        const newImportStripCount = importProduct.strip_count - stripDifference;

        // Update import_products table
        const { error: importUpdateError } = await supabase
          .from("import_products")
          .update({
            strip_count: newImportStripCount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentProduct.import_product_id);

        if (importUpdateError) throw importUpdateError;

        await fetchImportProducts(); // Refresh import products
      }

      await fetchProducts();
      alert("Stock updated successfully!");
    } catch (error: any) {
      console.error("Error updating stock:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      // Get the product to return strips to import_products
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("strip_count, import_product_id")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Delete the product
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;

      // ✨ RETURN STRIPS TO IMPORT_PRODUCTS IF LINKED
      if (product.import_product_id) {
        const { data: importProduct, error: importFetchError } = await supabase
          .from("import_products")
          .select("strip_count")
          .eq("id", product.import_product_id)
          .single();

        if (importFetchError) throw importFetchError;

        // Add the strips back to import_products
        const newImportStripCount =
          importProduct.strip_count + product.strip_count;

        const { error: importUpdateError } = await supabase
          .from("import_products")
          .update({
            strip_count: newImportStripCount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", product.import_product_id);

        if (importUpdateError) throw importUpdateError;

        await fetchImportProducts(); // Refresh import products
      }

      await fetchProducts();
      alert("Product deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting product:", error);
      alert(`Error: ${error.message}`);
    }
  };

  // Filters
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredImportProducts = importProducts.filter(
    (product) =>
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inventory">
            <Archive className="w-4 h-4 mr-2" />
            Current Inventory ({products.length})
          </TabsTrigger>
          <TabsTrigger value="import">
            <Package className="w-4 h-4 mr-2" />
            Import Products ({importProducts.length})
          </TabsTrigger>
          <TabsTrigger value="companies">
            <Building2 className="w-4 h-4 mr-2" />
            Companies ({companies.length})
          </TabsTrigger>
        </TabsList>

        {/* Current Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Inventory</CardTitle>
              <CardDescription>
                Manage your medical product stock levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Search by name, SKU, or brand code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              {isLoading ? (
                <div className="text-center py-8">Loading inventory...</div>
              ) : (
                <ProductInventoryTable
                  products={filteredProducts}
                  onEdit={(product) => {
                    console.log("Edit product:", product);
                  }}
                  onDelete={handleDeleteProduct}
                  onUpdateStock={handleUpdateStock}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import Products Tab */}
        <TabsContent value="import" className="space-y-4">
          {showImportForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingImportProduct
                    ? "Edit Import Product"
                    : "Add Import Product"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImportProductForm
                  companies={companies}
                  importProduct={editingImportProduct || undefined}
                  onSubmit={
                    editingImportProduct
                      ? handleUpdateImportProduct
                      : handleAddImportProduct
                  }
                  onCancel={() => {
                    setShowImportForm(false);
                    setEditingImportProduct(null);
                  }}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Import Products Catalog</CardTitle>
                  <CardDescription>
                    Master product list from companies
                  </CardDescription>
                </div>
                <Button onClick={() => setShowImportForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Import Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Search import products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  Loading import products...
                </div>
              ) : (
                <ImportProductTable
                  importProducts={filteredImportProducts}
                  onEdit={(product) => {
                    setEditingImportProduct(product);
                    setShowImportForm(true);
                  }}
                  onDelete={handleDeleteImportProduct}
                  onAddToInventory={handleAddToInventory}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Companies Tab */}
        <TabsContent value="companies" className="space-y-4">
          {showCompanyForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingCompany ? "Edit Company" : "Add Company"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CompanyForm
                  company={editingCompany || undefined}
                  onSubmit={
                    editingCompany ? handleUpdateCompany : handleAddCompany
                  }
                  onCancel={() => {
                    setShowCompanyForm(false);
                    setEditingCompany(null);
                  }}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Companies</CardTitle>
                  <CardDescription>
                    Manage pharmaceutical suppliers
                  </CardDescription>
                </div>
                <Button onClick={() => setShowCompanyForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Company
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading companies...</div>
              ) : (
                <CompanyTableRows
                  companies={companies}
                  onEdit={(company) => {
                    setEditingCompany(company);
                    setShowCompanyForm(true);
                  }}
                  onDelete={handleDeleteCompany}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
