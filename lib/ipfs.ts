// IPFS utility functions for Pinata

export async function uploadToIPFS(message: string): Promise<string> {
  try {
    console.log('Uploading to IPFS...');
    
    const JWT = process.env.NEXT_PUBLIC_PINATA_JWT;
    
    if (!JWT) {
      throw new Error('Pinata JWT not configured');
    }

    console.log('JWT exists:', !!JWT);

    // Store as JSON object for consistency
    const data = JSON.stringify({
      message: message,
      timestamp: Date.now(),
    });

    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JWT}`,
      },
      body: JSON.stringify({
        pinataContent: {
          message: message,
          timestamp: Date.now(),
        },
        pinataMetadata: {
          name: `message-${Date.now()}.json`,
        },
      }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pinata error:', errorText);
      throw new Error(`Failed to upload to IPFS: ${response.status}`);
    }

    const result = await response.json();
    console.log('Response data:', result);

    return result.IpfsHash;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
}

export async function getFromIPFS(hash: string): Promise<string> {
  try {
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    
    // Check if response is JSON or plain text
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return data.message || data.content || data.text || JSON.stringify(data);
    } else {
      // Plain text response
      const text = await response.text();
      
      // Try to parse as JSON in case content-type header is wrong
      try {
        const jsonData = JSON.parse(text);
        return jsonData.message || jsonData.content || jsonData.text || text;
      } catch {
        // Not JSON, return as-is
        return text;
      }
    }
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    throw error;
  }
}

export function extractImageFromContent(content: string): { text: string; imageUrl: string | null } {
  // Check for [IMAGE]url[/IMAGE] format
  const imageMatch = content.match(/\[IMAGE\](.*?)\[\/IMAGE\]/);
  
  if (imageMatch) {
    // Remove the image tag from content
    const text = content.replace(/\[IMAGE\].*?\[\/IMAGE\]/g, '').trim();
    return {
      text,
      imageUrl: imageMatch[1]
    };
  }
  
  // Match markdown image: ![alt](url)
  const markdownMatch = content.match(/!\[.*?\]\((.*?)\)/);
  if (markdownMatch) {
    const text = content.replace(/!\[.*?\]\(.*?\)/g, '').trim();
    return {
      text,
      imageUrl: markdownMatch[1]
    };
  }
  
  // Match HTML img tag: <img src="url" />
  const htmlMatch = content.match(/<img[^>]+src="([^">]+)"/);
  if (htmlMatch) {
    const text = content.replace(/<img[^>]*>/g, '').trim();
    return {
      text,
      imageUrl: htmlMatch[1]
    };
  }
  
  // Match plain URL that looks like an image
  const urlMatch = content.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)/i);
  if (urlMatch) {
    const text = content.replace(urlMatch[0], '').trim();
    return {
      text,
      imageUrl: urlMatch[0]
    };
  }
  
  return {
    text: content,
    imageUrl: null
  };
}