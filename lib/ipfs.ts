export async function uploadToIPFS(content: string) {
  try {
    const formData = new FormData();
    const blob = new Blob([content], { type: 'text/plain' });
    formData.append('file', blob, 'post.txt');

    console.log('Uploading to IPFS...');
    console.log('JWT exists:', !!process.env.NEXT_PUBLIC_PINATA_JWT);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
      },
      body: formData,
    });

    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    return data.IpfsHash;
  } catch (error) {
    console.error('Full error:', error);
    throw error;
  }
}

export async function getFromIPFS(hash: string) {
  try {
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`);
    const text = await response.text();
    return text;
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    throw error;
  }
}