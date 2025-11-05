// src/components/UserList.jsx
import { useEffect, useState } from "react";
import API from "../utils/api";
import "./Userlist.css";
export default function UserList({ user, onSelect }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    API.get("/users").then((res) => {
      const others = res.data.filter((u) => u._id !== user._id);
      setUsers(others);
    });
  }, []);

  return (
    <div className="w-1/4 bg-gray-100 p-4 border-r overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">Users</h2>
      {users.map((u) => (
        <div
          key={u._id}
          className="p-2 hover:bg-gray-200 rounded cursor-pointer"
          onClick={() => onSelect(u)}
        >
          {u.name}
        </div>
      ))}
    </div>
  );
}
