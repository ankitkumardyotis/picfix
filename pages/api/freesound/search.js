import axios from 'axios';

export default async function handler(req, res) {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  if (!process.env.FREESOUND_CLIENT_ID) {
    return res.status(500).json({ error: 'Freesound API key not configured' });
  }

  try {
    const apiKey = process.env.FREESOUND_CLIENT_ID;
    console.log('Making request to Freesound API...');
    console.log('Query:', query);

    const url = `https://freesound.org/apiv2/search/text/`;
    console.log('Request URL:', url);

    const response = await axios({
      method: 'get',
      url: url,
      params: {
        query: query,
        token: apiKey,
        fields: 'id,name,duration,license,previews,type',
        page_size: 15,
        filter: 'duration:[1 TO 300]',
        sort: 'rating_desc'
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'PicfixAI/1.0'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Freesound API response received:', response.data);
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error details:', error.response ? {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data
    } : error);

    res.status(500).json({ 
      error: error.response ? error.response.data.detail || 'Failed to fetch music' : 'Failed to fetch music' 
    });
  }
} 