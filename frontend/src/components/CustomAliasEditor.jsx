import React, { useState } from "react";
import { FiCheck, FiX, FiEdit2 } from "react-icons/fi";

export default function CustomAliasEditor({ shortId, currentAlias, token, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [alias, setAlias] = useState(currentAlias || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!alias.trim()) {
      setError("Alias cannot be empty");
      return;
    }

    // Validate alias format (alphanumeric, hyphens, underscores only)
    if (!/^[a-zA-Z0-9_-]+$/.test(alias)) {
      setError("Alias can only contain letters, numbers, hyphens, and underscores");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:3000/urls/${shortId}/alias`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ customAlias: alias }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to update alias");
      }

      onUpdate(alias);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setAlias(currentAlias || "");
    setError("");
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        {currentAlias ? (
          <span className="text-green-400 font-mono text-sm">/{currentAlias}</span>
        ) : (
          <span className="text-gray-500 text-sm">No custom alias</span>
        )}
        <button
          onClick={() => setIsEditing(true)}
          className="text-gray-400 hover:text-white transition"
          title="Edit alias"
        >
          <FiEdit2 size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-gray-400">/</span>
        <input
          type="text"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          placeholder="mycustomalias"
          className="flex-1 bg-slate-900 text-white placeholder-gray-500 px-3 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white p-1 rounded transition disabled:opacity-50"
          title="Save"
        >
          <FiCheck size={16} />
        </button>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white p-1 rounded transition disabled:opacity-50"
          title="Cancel"
        >
          <FiX size={16} />
        </button>
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}
