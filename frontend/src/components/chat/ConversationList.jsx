import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";
import { Hash, MessageCircle, Search, Plus } from "lucide-react";
import CreateGroupModal from "./CreateGroupModal";

const ConversationList = ({ user }) => {
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { roomId, receiverId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await API.get("rooms/my-chats");
        setConversations(res.data);
      } catch (err) {
        console.error("Failed to fetch conversations", err);
      }
    };
    fetchConversations();
  }, []);

  const handleGroupCreated = (newGroup) => {
    setConversations([newGroup, ...conversations]);
    navigate(`/interest-chat/${newGroup._id}`);
  };

  const filteredConversations = conversations.filter(conv => 
    (conv.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    conv.members.some(m => (m.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Messages</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-90"
            title="Create Group"
          >
            <Plus size={20} />
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search conversations..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <CreateGroupModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreated={handleGroupCreated}
      />

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
          Recent Chats
        </div>
        
        {filteredConversations.map((conv) => {
          const isGroup = conv.isGroup;
          const isActive = roomId === conv._id || (conv.members.length === 2 && conv.members.some(m => m._id === receiverId));
          
          // For private chats, find the OTHER member
          const otherMember = !isGroup ? conv.members.find(m => m._id !== (user.id || user._id)) : null;

          return (
            <div
              key={conv._id}
              onClick={() => {
                if (isGroup) {
                  navigate(`/interest-chat/${conv._id}`);
                } else {
                  navigate(`/private-chat/${otherMember?._id}`);
                }
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                isActive 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-100" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="relative flex-shrink-0">
                {isGroup ? (
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? "bg-blue-500" : "bg-gray-200"}`}>
                    <Hash size={20} className={isActive ? "text-white" : "text-gray-500"} />
                  </div>
                ) : (
                  <>
                    {otherMember?.profilePic ? (
                      <img src={otherMember.profilePic} className="w-10 h-10 rounded-full object-cover" alt="" />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? "bg-blue-500" : "bg-blue-100 text-blue-600"} font-bold`}>
                        {otherMember?.name?.charAt(0) || "?"}
                      </div>
                    )}
                    {/* Online status indicator placeholder */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${isActive ? "text-white" : "text-gray-900"}`}>
                  {isGroup ? conv.name : (otherMember?.name || "Private Chat")}
                </p>
                <p className={`text-xs truncate ${isActive ? "text-blue-100" : "text-gray-500"}`}>
                  {isGroup ? `${conv.members.length} members` : "Online"}
                </p>
              </div>
            </div>
          );
        })}

        {filteredConversations.length === 0 && (
          <div className="text-center py-8 px-4">
            <MessageCircle className="mx-auto text-gray-300 mb-2" size={32} />
            <p className="text-sm text-gray-400">No conversations found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
