import { useState, useEffect } from 'react';

export default function OfferMatcher() {
  // State to manage various aspects of the component
  const [apiResponse, setApiResponse] = useState(null);
  const [knowledgeBase, setKnowledgeBase] = useState(null);
  const [matchedOffers, setMatchedOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiInput, setApiInput] = useState('');
  const [kbInput, setKbInput] = useState('');
  
  // Function to simulate API call (in a real app, this would be a fetch to an actual API)
  const fetchOfferData = () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call with a timeout
      setTimeout(() => {
        // Parse the API input as JSON
        const parsedResponse = JSON.parse(apiInput);
        setApiResponse(parsedResponse);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError("Invalid API response JSON format");
      setLoading(false);
    }
  };

  // Function to load knowledge base
  const loadKnowledgeBase = () => {
    try {
      // Parse the knowledge base input as JSON
      const parsedKB = JSON.parse(kbInput);
      setKnowledgeBase(parsedKB);
    } catch (err) {
      setError("Invalid knowledge base JSON format");
    }
  };

  // Effect to find matches when both API response and knowledge base are available
  useEffect(() => {
    if (apiResponse && knowledgeBase) {
      findMatches();
    }
  }, [apiResponse, knowledgeBase]);

  // Function to find matches between API response and knowledge base
  const findMatches = () => {
    setLoading(true);
    setError(null);
    
    try {
      // Extract offerIds from API response (handles different possible formats)
      let offerIds = [];
      
      // Handle case where API response is an array of objects with offerId
      if (Array.isArray(apiResponse)) {
        offerIds = apiResponse.map(item => item.offerId).filter(id => id);
      } else if (apiResponse.offerId) {
        offerIds.push(apiResponse.offerId);
      } else if (apiResponse.offerIds) {
        offerIds = apiResponse.offerIds;
      } else if (apiResponse.offers && Array.isArray(apiResponse.offers)) {
        offerIds = apiResponse.offers.map(offer => offer.id || offer.offerId).filter(id => id);
      } else if (apiResponse.data && apiResponse.data.offerId) {
        offerIds.push(apiResponse.data.offerId);
      } else if (apiResponse.data && apiResponse.data.offerIds) {
        offerIds = apiResponse.data.offerIds;
      }
      
      // Find matching offers in the knowledge base
      const matches = [];
      
      // Handle different knowledge base formats
      const items = Array.isArray(knowledgeBase) ? knowledgeBase : 
                   knowledgeBase.items || knowledgeBase.offers || knowledgeBase.data || [];
      
      // Find all items that match any of the offerIds
      items.forEach(item => {
        const itemOfferId = item.offerId || item.id;
        if (itemOfferId && offerIds.includes(itemOfferId)) {
          matches.push(item);
        }
      });
      
      setMatchedOffers(matches);
      setLoading(false);
    } catch (err) {
      setError("Error processing data: " + err.message);
      setLoading(false);
    }
  };

  // Generate AI response based on matched offers
  const generateAIResponse = () => {
    if (matchedOffers.length === 0) {
      return "I couldn't find any matching offers in our knowledge base.";
    }
    
    if (matchedOffers.length === 1) {
      const offer = matchedOffers[0];
      return `I found an offer that matches your request: ${offer.title || offer.name || 'Offer'} ${offer.description ? `- ${offer.description}` : ''}. ${offer.price ? `It's available for ${offer.price}` : ''}`;
    }
    
    return `I found ${matchedOffers.length} matching offers for you. You can see the details below.`;
  };

  // Sample data for demonstration
  const sampleApiResponse = JSON.stringify([
    {
      "offerId": "offer-123",
      "someOtherData": "data1"
    },
    {
      "offerId": "offer-456",
      "someOtherData": "data2"
    }
  ], null, 2);

  const sampleKnowledgeBase = JSON.stringify([
    {
      "offerId": "offer-123",
      "title": "credit card-123",
      "description": "description about credit card-123"
    },
    {
      "offerId": "offer-456",
      "title": "credit card-456",
      "description": "description about credit card-456"
    },
    {
      "offerId": "offer-789",
      "title": "credit card-789",
      "description": "description about credit card-789"
        }
  ], null, 2);

  return (
    <div className="flex flex-col space-y-6 p-6 bg-gray-50 rounded-lg shadow-md max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-700">AI Offer Matcher</h1>
      
      {/* Input Section */}
      <div className="flex flex-col space-y-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">1. API Response (JSON)</h2>
          <textarea 
            className="w-full h-40 p-2 border border-gray-300 rounded"
            value={apiInput}
            onChange={(e) => setApiInput(e.target.value)}
            placeholder="Paste API response JSON here..."
          />
          <div className="flex justify-between">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={fetchOfferData}
            >
              Process API Response
            </button>
            <button 
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              onClick={() => setApiInput(sampleApiResponse)}
            >
              Load Sample
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">2. Knowledge Base (JSON)</h2>
          <textarea 
            className="w-full h-40 p-2 border border-gray-300 rounded"
            value={kbInput}
            onChange={(e) => setKbInput(e.target.value)}
            placeholder="Paste knowledge base JSON here..."
          />
          <div className="flex justify-between">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={loadKnowledgeBase}
            >
              Load Knowledge Base
            </button>
            <button 
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              onClick={() => setKbInput(sampleKnowledgeBase)}
            >
              Load Sample
            </button>
          </div>
        </div>
      </div>
      
      {/* Status and Error Display */}
      {loading && (
        <div className="p-4 bg-blue-100 text-blue-700 rounded">
          Processing data...
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      {/* AI Response Section */}
      {matchedOffers.length > 0 && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <h2 className="text-lg font-semibold">AI Response:</h2>
            <p className="mt-2">{generateAIResponse()}</p>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Matched Offers:</h2>
            <div className="space-y-4">
              {matchedOffers.map((offer, index) => (
                <div key={index} className="p-4 bg-white border border-gray-200 rounded shadow-sm">
                  <h3 className="font-semibold text-lg">{offer.title || offer.name || `Offer ${index + 1}`}</h3>
                  {offer.description && <p className="text-gray-700 mt-1">{offer.description}</p>}
                  {offer.price && <p className="text-green-600 font-medium mt-2">{offer.price}</p>}
                  <div className="mt-2 text-sm text-gray-500">
                    Offer ID: {offer.offerId || offer.id}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Debug Section */}
      {apiResponse && knowledgeBase && (
        <div className="border-t pt-4 mt-4">
          <details className="text-sm">
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
              Show Debug Information
            </summary>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <h3 className="font-semibold">API Response:</h3>
                <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-auto max-h-40">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold">Knowledge Base:</h3>
                <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-auto max-h-40">
                  {JSON.stringify(knowledgeBase, null, 2)}
                </pre>
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
