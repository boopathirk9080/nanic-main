"use client";

import { useEffect, useState } from "react";
import { Bell, User, Search } from "lucide-react";

export default function Header() {
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setUserEmail(userData.email);
    }
  }, []);

  return (
    <></>
    // <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
    //   <div className="flex-1 max-w-md">
    //     <div className="relative">
    //       <Search className="absolute left-3 top-3 w-5 h-5 text-muted" />
    //       <input
    //         type="text"
    //         placeholder="Search patients, claims..."
    //         className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
    //       />
    //     </div>
    //   </div>

    //   <div className="flex items-center gap-4">
    //     <button className="p-2 hover:bg-secondary-light rounded-lg transition-colors">
    //       <Bell className="w-5 h-5 text-foreground" />
    //     </button>
    //     <div className="flex items-center gap-3 pl-4 border-l border-border">
    //       <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
    //         <User className="w-5 h-5 text-white" />
    //       </div>
    //       <div>
    //         <p className="text-sm font-medium text-foreground">{userEmail}</p>
    //         <p className="text-xs text-muted">Billing Specialist</p>
    //       </div>
    //     </div>
    //   </div>
    // </header>
  );
}

// "use client"

// import { useEffect, useState } from "react"
// import { Bell, User, Search } from "lucide-react"

// export default function Header() {
//   const [userEmail, setUserEmail] = useState("")

//   useEffect(() => {
//     const user = localStorage.getItem("user")
//     if (user) {
//       const userData = JSON.parse(user)
//       setUserEmail(userData.email)
//     }
//   }, [])

//   return (
//     <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
//       <div className="flex-1 max-w-md">
//         <div className="relative">
//           <Search className="absolute left-3 top-3 w-5 h-5 text-muted" />
//           <input
//             type="text"
//             placeholder="Search patients, claims..."
//             className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
//           />
//         </div>
//       </div>

//       <div className="flex items-center gap-4">
//         <button className="p-2 hover:bg-secondary-light rounded-lg transition-colors">
//           <Bell className="w-5 h-5 text-foreground" />
//         </button>
//         <div className="flex items-center gap-3 pl-4 border-l border-border">
//           <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
//             <User className="w-5 h-5 text-white" />
//           </div>
//           <div>
//             <p className="text-sm font-medium text-foreground">{userEmail}</p>
//             {/* <p className="text-xs text-muted">Billing Specialist</p> */}
//           </div>
//         </div>
//       </div>
//     </header>
//   )
// }
