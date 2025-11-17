// // app/purchase/localTable.tsx
// 'use client';

// import React, { useState, useEffect } from 'react';
// import { createClient } from "@/lib/supabase/client";
// import LocalForm from './localForm';

// const supabase = createClient();

// type LocalCompany = {
//   id: string;
//   user_id: string;
//   company_name: string;
//   company_code: string;
//   contact_person: string | null;
//   contact_email: string | null;
//   contact_phone: string | null;
//   address: string | null;
//   city: string | null;
//   state: string | null;
//   postal_code: string | null;
//   gst_number: string | null;
//   created_at: string;
//   updated_at: string;
// };

// export default function LocalTable() {
//   const [companies, setCompanies] = useState<LocalCompany[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [editingCompany, setEditingCompany] = useState<LocalCompany | null>(null);
//   const [userId, setUserId] = useState<string | null>(null);

//   useEffect(() => {
//     fetchUserAndCompanies();
//   }, []);

//   const fetchUserAndCompanies = async () => {
//     const { data: { user } } = await supabase.auth.getUser();
//     if (user) {
//       setUserId(user.id);
//       await fetchCompanies(user.id);
//     }
//     setLoading(false);
//   };

//   const fetchCompanies = async (uid: string) => {
//     const { data, error } = await supabase
//       .from('local_companies')
//       .select('*')
//       .eq('user_id', uid)
//       .order('created_at', { ascending: false });

//     if (error) {
//       console.error('Error fetching companies:', error);
//     } else {
//       setCompanies(data || []);
//     }
//   };

//   const handleAddCompany = () => {
//     setEditingCompany(null);
//     setShowForm(true);
//   };

//   const handleEditCompany = (company: LocalCompany) => {
//     setEditingCompany(company);
//     setShowForm(true);
//   };

//   const handleDeleteCompany = async (id: string) => {
//     if (confirm('Are you sure you want to delete this company?')) {
//       const { error } = await supabase.from('local_companies').delete().eq('id', id);
//       if (error) {
//         console.error('Error deleting company:', error);
//       } else {
//         await fetchCompanies(userId!);
//       }
//     }
//   };

//   const handleFormSubmit = async () => {
//     setShowForm(false);
//     await fetchCompanies(userId!);
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div>
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-xl font-bold">Local Companies</h2>
//         <button
//           onClick={handleAddCompany}
//           className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
//         >
//           Add Company
//         </button>
//       </div>

//       <table className="min-w-full border-collapse border border-gray-300">
//         <thead>
//           <tr className="bg-gray-100">
//             <th className="border border-gray-300 px-4 py-2">Company Name</th>
//             <th className="border border-gray-300 px-4 py-2">Company Code</th>
//             <th className="border border-gray-300 px-4 py-2">Contact Person</th>
//             <th className="border border-gray-300 px-4 py-2">Contact Email</th>
//             <th className="border border-gray-300 px-4 py-2">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {companies.map((company) => (
//             <tr key={company.id} className="hover:bg-gray-50">
//               <td className="border border-gray-300 px-4 py-2">{company.company_name}</td>
//               <td className="border border-gray-300 px-4 py-2">{company.company_code}</td>
//               <td className="border border-gray-300 px-4 py-2">{company.contact_person || '-'}</td>
//               <td className="border border-gray-300 px-4 py-2">{company.contact_email || '-'}</td>
//               <td className="border border-gray-300 px-4 py-2">
//                 <button
//                   onClick={() => handleEditCompany(company)}
//                   className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => handleDeleteCompany(company.id)}
//                   className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
//                 >
//                   Delete
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {showForm && (
//         <LocalForm
//           company={editingCompany}
//           userId={userId!}
//           onClose={() => setShowForm(false)}
//           onSubmit={handleFormSubmit}
//         />
//       )}
//     </div>
//   );
// }



// app/purchase/localTable.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2 } from "lucide-react";
import LocalForm from './localForm';

const supabase = createClient();

type LocalCompany = {
  id: string;
  user_id: string;
  company_name: string;
  company_code: string;
  contact_person: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  gst_number: string | null;
  created_at: string;
  updated_at: string;
};

export default function LocalTable() {
  const [companies, setCompanies] = useState<LocalCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<LocalCompany | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchUserAndCompanies();
  }, []);

  const fetchUserAndCompanies = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      await fetchCompanies(user.id);
    }
    setLoading(false);
  };

  const fetchCompanies = async (uid: string) => {
    const { data, error } = await supabase
      .from('local_companies')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching companies:', error);
    } else {
      setCompanies(data || []);
    }
  };

  const handleAddCompany = () => {
    setEditingCompany(null);
    setShowForm(true);
  };

  const handleEditCompany = (company: LocalCompany) => {
    setEditingCompany(company);
    setShowForm(true);
  };

  const handleDeleteCompany = async (id: string) => {
    if (confirm('Are you sure you want to delete this company?')) {
      const { error } = await supabase.from('local_companies').delete().eq('id', id);
      if (error) {
        console.error('Error deleting company:', error);
      } else {
        await fetchCompanies(userId!);
      }
    }
  };

  const handleMultiDelete = async (companyIds: string[]) => {
    if (confirm(`Are you sure you want to delete ${companyIds.length} companies?`)) {
      const { error } = await supabase.from('local_companies').delete().in('id', companyIds);
      if (error) {
        console.error('Error deleting companies:', error);
      } else {
        setSelectedCompanies(new Set());
        await fetchCompanies(userId!);
      }
    }
  };

  const handleSelectCompany = (companyId: string) => {
    const newSelected = new Set(selectedCompanies);
    if (newSelected.has(companyId)) {
      newSelected.delete(companyId);
    } else {
      newSelected.add(companyId);
    }
    setSelectedCompanies(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedCompanies.size === companies.length) {
      setSelectedCompanies(new Set());
    } else {
      setSelectedCompanies(new Set(companies.map((c) => c.id)));
    }
  };

  const handleFormSubmit = async () => {
    setShowForm(false);
    await fetchCompanies(userId!);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No local companies found.</p>
        <p className="text-sm mt-2">Add your first company to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Local Companies</h2>
        <Button
          onClick={handleAddCompany}
          className="bg-green-500 text-white hover:bg-green-600"
        >
          Add Company
        </Button>
      </div>

      {selectedCompanies.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
          <span className="text-sm font-medium text-blue-900">
            {selectedCompanies.size} company(ies) selected
          </span>
          <div className="flex gap-2">
            <Button
              onClick={() => handleMultiDelete(Array.from(selectedCompanies))}
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
              size="sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-semibold w-10">
                <Checkbox
                  checked={selectedCompanies.size === companies.length && companies.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="text-left py-3 px-4 font-semibold">Company Name</th>
              <th className="text-left py-3 px-4 font-semibold">Company Code</th>
              <th className="text-left py-3 px-4 font-semibold">Contact Person</th>
              <th className="text-left py-3 px-4 font-semibold">Contact Email</th>
              <th className="text-center py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {companies.map((company) => (
              <tr key={company.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <Checkbox
                    checked={selectedCompanies.has(company.id)}
                    onCheckedChange={() => handleSelectCompany(company.id)}
                  />
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium">{company.company_name}</div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">{company.company_code}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{company.contact_person || '-'}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{company.contact_email || '-'}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-1 justify-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditCompany(company)}
                      title="Edit Company"
                      className="hover:bg-yellow-50 h-8 w-8 p-0"
                    >
                      <Edit2 className="w-4 h-4 text-yellow-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteCompany(company.id)}
                      title="Delete Company"
                      className="hover:bg-red-50 h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <LocalForm
          company={editingCompany}
          userId={userId!}
          onClose={() => setShowForm(false)}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
}