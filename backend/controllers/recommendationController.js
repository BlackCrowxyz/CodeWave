import dotenv from 'dotenv';

dotenv.config();

const LM_STUDIO_URL = process.env.LM_STUDIO_URL || 'http://localhost:1234/v1/chat/completions';

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({
        status: status,
        message: message,
        data: data,
    });
};

/**
 * Get AI-powered recommendations based on trip plan
 */
export const getRecommendations = async (req, res, next) => {
    try {
        const { budget, currentLocation, duration, interests } = req.body;

        // Validation
        if (!budget || budget <= 0 || !duration || duration <= 0 || !currentLocation || !Array.isArray(currentLocation) || currentLocation.length !== 2) {
            return handleResponse(res, 400, "Budget (positive number), duration (positive number), and currentLocation ([lat, lng] array) are required");
        }

        const [lat, lng] = currentLocation;
        const interestsText = interests && interests.length > 0 ? interests.join(', ') : 'No specific preferences';

        // Build the prompt for the LLM
        const prompt = `You are a travel recommendation assistant for Ireland. Based on the following trip details, recommend 5-8 places to visit in Ireland that match the user's preferences.

Trip Details:
- Budget: €${budget}
- Duration: ${duration} ${duration === 1 ? 'day' : 'days'}
- Current Location: ${lat.toFixed(4)}, ${lng.toFixed(4)} (latitude, longitude)
- Interests: ${interestsText}

Please provide recommendations in JSON format as an array of objects. Each object should have:
- name: string (name of the place)
- type: string (category like "Nature", "Historical", "Shopping", "Food", "Entertainment", etc.)
- description: string (brief 1-2 sentence description)
- estimatedCost: string (estimated cost in euros, e.g., "Free", "€5-10", "€20-30")
- distance: string (distance from location, e.g., "1.5km", "5km")
- lat: number (latitude coordinate)
- lng: number (longitude coordinate)
- featured: boolean (true for top recommendations)

Focus on places in Ireland, especially around the specified location. Make the recommendations realistic and budget-appropriate.

Return ONLY valid JSON array, no markdown, no code blocks, just the array.`;

        // Call LM Studio API
        let response;
        try {
            response = await fetch(LM_STUDIO_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'local-model', // LM Studio uses this for local models
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful travel assistant that provides recommendations in JSON format only.',
                        },
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    temperature: 0.7,
                    max_tokens: 2000,
                }),
            });
        } catch (fetchError) {
            console.error('Error connecting to LM Studio:', fetchError);
            // Fallback to mock data if LLM is not available
            return handleResponse(res, 200, "Recommendations retrieved (using fallback)", getFallbackRecommendations(currentLocation));
        }

        if (!response.ok) {
            console.error('LM Studio API error:', response.status, response.statusText);
            // Fallback to mock data if LLM is not available
            return handleResponse(res, 200, "Recommendations retrieved (using fallback)", getFallbackRecommendations(currentLocation));
        }

        const data = await response.json();

        // Extract the content from the response
        let recommendations = [];
        if (data.choices && data.choices[0] && data.choices[0].message) {
            const content = data.choices[0].message.content;

            // Try to parse JSON from the response
            try {
                // Remove markdown code blocks if present
                const jsonMatch = content.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    recommendations = JSON.parse(jsonMatch[0]);
                } else {
                    recommendations = JSON.parse(content);
                }
            } catch (parseError) {
                console.error('Error parsing LLM response:', parseError);
                console.error('LLM response content:', content);
                // Fallback to mock data
                recommendations = getFallbackRecommendations(currentLocation);
            }
        } else {
            console.error('Unexpected LM Studio response structure:', data);
            // Fallback if response structure is unexpected
            recommendations = getFallbackRecommendations(currentLocation);
        }

        // Validate and format recommendations
        const formattedRecommendations = recommendations
            .filter(rec => rec.name && rec.type)
            .map(rec => ({
                name: rec.name,
                type: rec.type,
                description: rec.description || '',
                estimatedCost: rec.estimatedCost || 'Varies',
                distance: rec.distance || 'Unknown',
                latlng: rec.lat && rec.lng ? [parseFloat(rec.lat), parseFloat(rec.lng)] : [51.897, -8.475], // Default to Cork
                featured: rec.featured || false,
            }))
            .slice(0, 8); // Limit to 8 recommendations

        return handleResponse(res, 200, "Recommendations retrieved successfully", formattedRecommendations);
    } catch (error) {
        console.error("Error getting recommendations:", error);

        // Fallback to mock data on error
        const { currentLocation } = req.body;
        const fallbackLocation = currentLocation && Array.isArray(currentLocation) && currentLocation.length === 2
            ? currentLocation
            : [53.3498, -6.2603]; // Default to Dublin
        return handleResponse(res, 200, "Recommendations retrieved (using fallback)", getFallbackRecommendations(fallbackLocation));
    }
};

/**
 * Fallback recommendations when LLM is unavailable
 */
function getFallbackRecommendations(currentLocation) {
    // Default recommendations for Ireland
    // Use provided location or default to Dublin
    const [lat, lng] = currentLocation && Array.isArray(currentLocation) && currentLocation.length === 2
        ? currentLocation
        : [53.3498, -6.2603];

    return [
        {
            name: "The Lough Park",
            type: "Nature",
            description: "A beautiful park with a lake, perfect for a peaceful walk",
            estimatedCost: "Free",
            distance: "1.6km",
            latlng: [51.889, -8.484],
            featured: true,
        },
        {
            name: "English Market",
            type: "Shopping",
            description: "Historic covered market with local produce and crafts",
            estimatedCost: "€5-20",
            distance: "1.9km",
            latlng: [51.897, -8.474],
            featured: false,
        },
        {
            name: "Bell's Field",
            type: "Nature",
            description: "Scenic park area with great views",
            estimatedCost: "Free",
            distance: "2.9km",
            latlng: [51.903, -8.470],
            featured: false,
        },
        {
            name: "Tramore Valley Park",
            type: "Nature",
            description: "Large park with walking trails and recreational facilities",
            estimatedCost: "Free",
            distance: "3.6km",
            latlng: [51.878, -8.459],
            featured: false,
        },
        {
            name: "Cork City Gaol",
            type: "Historical",
            description: "19th-century prison museum with guided tours",
            estimatedCost: "€10-15",
            distance: "2.1km",
            latlng: [51.900, -8.480],
            featured: true,
        },
        {
            name: "St. Fin Barre's Cathedral",
            type: "Historical",
            description: "Beautiful Gothic cathedral with stunning architecture",
            estimatedCost: "€5-8",
            distance: "1.8km",
            latlng: [51.895, -8.476],
            featured: false,
        },
    ];
}


/*
Example cURL to test the endpoint:

curl --location 'http://localhost:3001/api/v1/recommendations' \
--header 'Content-Type: application/json' \
--header 'x-access-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJuYW1lIjoiSm9obiBEb2UiLCJyb2xlIjoidXNlciIsImlhdCI6MTc2MzQ2MzAwNCwiZXhwIjoxNzYzNjM1ODA0fQ.Qo-ViHXRh6XnNfSv80ZwuVp_imI0GrQXpBPMakwTGyc' \
--data '{
    "budget": 150,
    "currentLocation": [
        51.8979,
        -8.4706
    ],
    "duration": 3,
    "interests": [
        "nature",
        "food",
        "history"
    ]
}'
*/