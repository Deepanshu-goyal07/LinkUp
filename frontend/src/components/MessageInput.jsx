import React, { useState, useRef } from 'react';

export default function MessageInput({
  currentTarget,
  onSendMessage
}) {
  const [inputText, setInputText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if ((text || selectedFiles.length > 0) && currentTarget) {
      setIsUploading(true);
      await onSendMessage(text, selectedFiles);
      setInputText('');
      setSelectedFiles([]);
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!currentTarget) return null;

  return (
    <form id="form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: 'auto', minHeight: '3rem' }}>
      {selectedFiles.length > 0 && (
        <div style={{ flexShrink: 0, padding: '0.5rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
          <strong>Attached files ({selectedFiles.length}):</strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
            {selectedFiles.map((f, i) => (
              <span key={i} style={{ background: '#e0e0e0', padding: '0.3rem 0.8rem', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', fontSize: '0.85rem' }}>
                {f.name}
                <button 
                  type="button" 
                  onClick={() => handleRemoveFile(i)} 
                  style={{
                    marginLeft: '0.6rem',
                    border: 'none',
                    background: '#ff5555',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    lineHeight: '1',
                    padding: 0
                  }}
                  title="Remove file"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', flexShrink: 0 }}>
        <input
          type="file"
          id="file-input"
          ref={fileInputRef}
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()}
          className="form-btn"
          style={{ marginRight: '0.5rem', whiteSpace: 'nowrap' }}
          disabled={isUploading}
        >
          📎 Attach
        </button>
        <input
          id="input"
          autoComplete="off"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isUploading}
          placeholder={isUploading ? "Uploading files..." : "Type a message..."}
          style={{ flex: 1 }}
        />
        <button 
          type="submit" 
          className="form-btn"
          disabled={isUploading || (!inputText.trim() && selectedFiles.length === 0)}
        >
          {isUploading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </form>
  );
}
