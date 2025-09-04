import React, { useState, useEffect } from 'react';

const SimpleURLShortener = () => {
  const [urls, setUrls] = useState([]);
  const [longUrl, setLongUrl] = useState('');
  const [customCode, setCustomCode] = useState('');

  const words = ['cat', 'dog', 'sun', 'moon', 'tree'];
  
  const generateCode = () => {
    const word = words[Math.floor(Math.random() * words.length)];
    const num = Math.floor(Math.random() * 99) + 1;
    return `${word}${num}`;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const isExpired = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMinutes = (now - created) / (1000 * 60);
    return diffMinutes > 30;
  };

  const createShortUrl = () => {
    if (!longUrl.trim()) {
      alert('Please enter a URL');
      return;
    }

    if (!isValidUrl(longUrl)) {
      alert('Please enter a valid URL');
      return;
    }

    const fullUrl = longUrl.startsWith('http') ? longUrl : `https://${longUrl}`;
    const code = customCode.trim() || generateCode();
    
    if (urls.some(url => url.code === code && !isExpired(url.createdAt))) {
      alert('This name is taken');
      return;
    }

    const newUrl = {
      id: Date.now(),
      long: fullUrl,
      code: code,
      clicks: 0,
      createdAt: new Date()
    };

    setUrls([newUrl, ...urls]);
    setLongUrl('');
    setCustomCode('');
  };

  const handleRedirect = (code) => {
    const url = urls.find(u => u.code === code);
    
    if (!url || isExpired(url.createdAt)) {
      alert('Link not found or expired');
      return;
    }

    setUrls(prevUrls => 
      prevUrls.map(u => 
        u.id === url.id ? {...u, clicks: u.clicks + 1} : u
      )
    );

    if (confirm(`Go to: ${url.long}`)) {
      window.open(url.long, '_blank');
    }
  };

  const copyLink = (code) => {
    const link = `${window.location.origin}#${code}`;
    navigator.clipboard.writeText(link).then(() => {
      alert('Copied');
    });
  };

  const deleteUrl = (id) => {
    if (confirm('Delete?')) {
      setUrls(urls.filter(url => url.id !== id));
    }
  };

  const getTimeLeft = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMinutes = 30 - Math.floor((now - created) / (1000 * 60));
    return Math.max(0, diffMinutes);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setUrls(prevUrls => prevUrls.filter(url => !isExpired(url.createdAt)));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        handleRedirect(hash);
        window.location.hash = '';
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [urls]);

  const activeUrls = urls.filter(url => !isExpired(url.createdAt));

  return (
    <div style={{
      maxWidth: '500px',
      margin: '20px auto',
      padding: '15px',
      fontFamily: 'Arial, sans-serif',
      lineHeight: '1.4',
      backgroundColor: '#f0f4f8'
    }}>
      
      <div style={{
        textAlign: 'center',
        marginBottom: '25px',
        padding: '20px',
        backgroundColor: '#4a90e2',
        color: 'white',
        borderRadius: '6px'
      }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>
          Link Shortener
        </h1>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
          Links expire after 30 minutes
        </p>
      </div>

      <div style={{
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '6px',
        marginBottom: '20px',
        border: '1px solid #e1e8ed'
      }}>
        <input
          type="text"
          placeholder="Enter URL"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && createShortUrl()}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '14px',
            border: '2px solid #e1e8ed',
            borderRadius: '4px',
            marginBottom: '12px',
            boxSizing: 'border-box',
            outline: 'none'
          }}
          onFocus={(e) => e.target.style.borderColor = '#4a90e2'}
          onBlur={(e) => e.target.style.borderColor = '#e1e8ed'}
        />
        
        <input
          type="text"
          placeholder="Custom name (optional)"
          value={customCode}
          onChange={(e) => setCustomCode(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
          onKeyPress={(e) => e.key === 'Enter' && createShortUrl()}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '14px',
            border: '2px solid #e1e8ed',
            borderRadius: '4px',
            marginBottom: '15px',
            boxSizing: 'border-box',
            outline: 'none'
          }}
          onFocus={(e) => e.target.style.borderColor = '#4a90e2'}
          onBlur={(e) => e.target.style.borderColor = '#e1e8ed'}
        />
        
        <button
          onClick={createShortUrl}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            backgroundColor: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#357abd'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#4a90e2'}
        >
          Create Link
        </button>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '6px',
        padding: '20px',
        border: '1px solid #e1e8ed'
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#333' }}>Your Links</h3>
        
        {activeUrls.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '30px',
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px'
          }}>
            <p style={{ margin: 0 }}>No links yet</p>
            <small>Create your first link above</small>
          </div>
        ) : (
          activeUrls.map(url => {
            const timeLeft = getTimeLeft(url.createdAt);
            const isExpiring = timeLeft <= 5;
            
            return (
              <div key={url.id} style={{
                border: '1px solid #e1e8ed',
                borderRadius: '4px',
                padding: '15px',
                marginBottom: '12px',
                backgroundColor: isExpiring ? '#fff3cd' : '#f8f9fa'
              }}>
                
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  wordBreak: 'break-all',
                  color: '#4a90e2'
                }}
                onClick={() => handleRedirect(url.code)}>
                  {window.location.origin}#{url.code}
                </div>
                
                <div style={{ 
                  fontSize: '13px',
                  marginBottom: '10px',
                  wordBreak: 'break-all',
                  color: '#555'
                }}>
                  Goes to: {url.long}
                </div>
                
                <div style={{
                  fontSize: '12px',
                  marginBottom: '12px',
                  color: '#666'
                }}>
                  <span style={{ color: '#28a745' }}>{url.clicks} clicks</span>
                  {' • '}
                  <span style={{ color: isExpiring ? '#dc3545' : '#6c757d' }}>
                    {timeLeft} minutes left
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => copyLink(url.code)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
                  >
                    Copy
                  </button>
                  
                  <button
                    onClick={() => handleRedirect(url.code)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#138496'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#17a2b8'}
                  >
                    Test
                  </button>
                  
                  <button
                    onClick={() => deleteUrl(url.id)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {activeUrls.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '6px',
          padding: '20px',
          marginTop: '15px',
          textAlign: 'center',
          border: '1px solid #e1e8ed'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: '#4a90e2'
              }}>
                {activeUrls.length}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Links</div>
            </div>
            <div>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: '#28a745'
              }}>
                {activeUrls.reduce((total, url) => total + url.clicks, 0)}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Clicks</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleURLShortener;