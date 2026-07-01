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
    <form id="form" onSubmit={handleSubmit}>
      {/* File Attachment Previews Panel */}
      {selectedFiles.length > 0 && (
        <div className="attachment-previews-container">
          <div className="attachment-previews-title">
            Pending Uploads ({selectedFiles.length})
          </div>
          <div className="previews-list">
            {selectedFiles.map((f, i) => (
              <span key={i} className="preview-file-tag">
                <span style={{ fontSize: '0.9rem' }}>📄</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                  {f.name}
                </span>
                <button 
                  type="button" 
                  onClick={() => handleRemoveFile(i)} 
                  className="btn-remove-preview"
                  title="Remove file"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Input Row */}
      <div className="form-main-input-row">
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
          className="form-btn btn-attach"
          disabled={isUploading}
          title="Attach Files"
        >
          {/* SVG Paperclip */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
          </svg>
          <span className="btn-text-desktop" style={{ marginLeft: '0.25rem', fontSize: '0.85rem' }}>Attach</span>
        </button>
        
        <input
          id="input"
          autoComplete="off"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isUploading}
          placeholder={isUploading ? "Uploading attachments to server..." : "Type your message..."}
        />
        
        <button 
          type="submit" 
          className="form-btn"
          disabled={isUploading || (!inputText.trim() && selectedFiles.length === 0)}
          title="Send message"
        >
          {isUploading ? (
            <span>Sending...</span>
          ) : (
            <>
              {/* SVG Send Airplane */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
              <span className="btn-text-desktop" style={{ marginLeft: '0.25rem' }}>Send</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
