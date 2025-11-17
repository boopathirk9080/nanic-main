// // app/purchase/localForm.tsx
// 'use client';

// import React, { useState, useEffect } from 'react';
// import { createClient } from "@/lib/supabase/client";

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

// interface LocalFormProps {
//   company?: LocalCompany | null;
//   userId: string;
//   onClose: () => void;
//   onSubmit: () => void;
// }

// export default function LocalForm({ company, userId, onClose, onSubmit }: LocalFormProps) {
//   const [formData, setFormData] = useState({
//     company_name: '',
//     company_code: '',
//     contact_person: '',
//     contact_email: '',
//     contact_phone: '',
//     address: '',
//     city: '',
//     state: '',
//     postal_code: '',
//     gst_number: '',
//   });
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (company) {
//       setFormData({
//         company_name: company.company_name,
//         company_code: company.company_code,
//         contact_person: company.contact_person || '',
//         contact_email: company.contact_email || '',
//         contact_phone: company.contact_phone || '',
//         address: company.address || '',
//         city: company.city || '',
//         state: company.state || '',
//         postal_code: company.postal_code || '',
//         gst_number: company.gst_number || '',
//       });
//     }
//   }, [company]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     const data = {
//       ...formData,
//       user_id: userId,
//     };

//     let result;
//     if (company) {
//       // Update
//       const { error } = await supabase
//         .from('local_companies')
//         .update({ ...data, updated_at: new Date().toISOString() })
//         .eq('id', company.id);
//       result = { error };
//     } else {
//       // Create
//       const { data: insertData, error } = await supabase
//         .from('local_companies')
//         .insert(data)
//         .select()
//         .single();
//       result = { data: insertData, error };
//     }

//     setLoading(false);
//     if (result.error) {
//       console.error('Error saving company:', result.error);
//       alert('Error saving company. Please try again.');
//     } else {
//       onSubmit();
//       onClose();
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
//         <h2 className="text-xl font-bold mb-4">{company ? 'Edit Company' : 'Add Company'}</h2>
//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label className="block text-sm font-medium mb-1">Company Name *</label>
//             <input
//               type="text"
//               name="company_name"
//               value={formData.company_name}
//               onChange={handleChange}
//               required
//               className="w-full border border-gray-300 px-3 py-2 rounded"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium mb-1">Company Code *</label>
//             <input
//               type="text"
//               name="company_code"
//               value={formData.company_code}
//               onChange={handleChange}
//               required
//               className="w-full border border-gray-300 px-3 py-2 rounded"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium mb-1">Contact Person</label>
//             <input
//               type="text"
//               name="contact_person"
//               value={formData.contact_person}
//               onChange={handleChange}
//               className="w-full border border-gray-300 px-3 py-2 rounded"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium mb-1">Contact Email</label>
//             <input
//               type="email"
//               name="contact_email"
//               value={formData.contact_email}
//               onChange={handleChange}
//               className="w-full border border-gray-300 px-3 py-2 rounded"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium mb-1">Contact Phone</label>
//             <input
//               type="tel"
//               name="contact_phone"
//               value={formData.contact_phone}
//               onChange={handleChange}
//               className="w-full border border-gray-300 px-3 py-2 rounded"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium mb-1">Address</label>
//             <textarea
//               name="address"
//               value={formData.address}
//               onChange={handleChange}
//               rows={3}
//               className="w-full border border-gray-300 px-3 py-2 rounded"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium mb-1">City</label>
//             <input
//               type="text"
//               name="city"
//               value={formData.city}
//               onChange={handleChange}
//               className="w-full border border-gray-300 px-3 py-2 rounded"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium mb-1">State</label>
//             <input
//               type="text"
//               name="state"
//               value={formData.state}
//               onChange={handleChange}
//               className="w-full border border-gray-300 px-3 py-2 rounded"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium mb-1">Postal Code</label>
//             <input
//               type="text"
//               name="postal_code"
//               value={formData.postal_code}
//               onChange={handleChange}
//               className="w-full border border-gray-300 px-3 py-2 rounded"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium mb-1">GST Number</label>
//             <input
//               type="text"
//               name="gst_number"
//               value={formData.gst_number}
//               onChange={handleChange}
//               className="w-full border border-gray-300 px-3 py-2 rounded"
//             />
//           </div>
//           <div className="flex space-x-2">
//             <button
//               type="submit"
//               disabled={loading}
//               className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
//             >
//               {loading ? 'Saving...' : 'Save'}
//             </button>
//             <button
//               type="button"
//               onClick={onClose}
//               className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }




// app/purchase/localForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

interface LocalFormProps {
  company?: LocalCompany | null;
  userId: string;
  onClose: () => void;
  onSubmit: () => void;
}

export default function LocalForm({ company, userId, onClose, onSubmit }: LocalFormProps) {
  const [formData, setFormData] = useState({
    company_name: '',
    company_code: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    gst_number: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (company) {
      setFormData({
        company_name: company.company_name,
        company_code: company.company_code,
        contact_person: company.contact_person || '',
        contact_email: company.contact_email || '',
        contact_phone: company.contact_phone || '',
        address: company.address || '',
        city: company.city || '',
        state: company.state || '',
        postal_code: company.postal_code || '',
        gst_number: company.gst_number || '',
      });
    }
  }, [company]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      ...formData,
      user_id: userId,
    };

    let result;
    if (company) {
      // Update
      const { error } = await supabase
        .from('local_companies')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', company.id);
      result = { error };
    } else {
      // Create
      const { data: insertData, error } = await supabase
        .from('local_companies')
        .insert(data)
        .select()
        .single();
      result = { data: insertData, error };
    }

    setLoading(false);
    if (result.error) {
      console.error('Error saving company:', result.error);
      alert('Error saving company. Please try again.');
    } else {
      onSubmit();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle>{company ? 'Edit Company' : 'Add Company'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_name">Company Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    type="text"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="company_code">Company Code <span className="text-red-500">*</span></Label>
                  <Input
                    id="company_code"
                    name="company_code"
                    type="text"
                    value={formData.company_code}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    name="contact_person"
                    type="text"
                    value={formData.contact_person}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    name="contact_phone"
                    type="tel"
                    value={formData.contact_phone}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="gst_number">GST Number</Label>
                  <Input
                    id="gst_number"
                    name="gst_number"
                    type="text"
                    value={formData.gst_number}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    type="text"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    name="postal_code"
                    type="text"
                    value={formData.postal_code}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}