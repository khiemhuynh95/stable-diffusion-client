const sendRequest = async (method, url, data) => {
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                // This is your API key
                //authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
                accept: 'application/json',
                'content-type': 'application/json',
            },
            body: method === 'POST' ? JSON.stringify(data) : null
        });

        if (response.ok) {
            // Request succeeded
            const data = await response.json();
            console.log('Response data:', data);
            return data;
        } else {
            // Request failed
            console.error('Request failed:', response.status, response.statusText);
        }
    } catch (error) {
        // Error occurred during the request
        console.error('Request error:', error);
    }
}

export async function getImage (data, url) {
    return sendRequest('POST', url, data)
};

export async function changeModel (model, url) {
    const data = {
        sd_model: model
    }
    return sendRequest('POST', url, data)
};

export async function getSamplers(url) {
    return sendRequest('GET', url)
};

export async function getModels (url) {
    return sendRequest('GET', url)
};