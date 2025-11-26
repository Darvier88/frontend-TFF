const API_BASE_URL = "http://localhost:8080";

interface Tweet {
  id: string;
  text: string;
  is_retweet: boolean;
  author_id?: string;
  created_at?: string;
  referenced_tweets?: any[];
  [key: string]: any;
}

export const searchAndStoreTweets = async (sessionId: string) => {
  const response = await fetch(
    `${API_BASE_URL}/api/tweets/search?session_id=${sessionId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        max_tweets: null,
        save_to_file: false  // ✅ Ya no guardamos archivos
      })
    }
  );

  const data = await response.json();
  
  if (data.success) {
    // ✅ Guardar tweets COMPLETOS en localStorage
    if (data.tweets && Array.isArray(data.tweets)) {
      localStorage.setItem("tweets_data", JSON.stringify(data.tweets));
      localStorage.setItem("tweet_count", data.tweets.length.toString());
    }
    
    // Guardar info del usuario
    if (data.user) {
      localStorage.setItem("user_data", JSON.stringify(data.user));
    }
    
    return data;
  }
  
  throw new Error(data.error || "Failed to search tweets");
};

export const classifyTweets = async (
  sessionId: string, 
  maxTweets?: number
): Promise<any> => {
  // Obtener tweets de localStorage
  const tweetsDataStr = localStorage.getItem("tweets_data");
  
  if (!tweetsDataStr) {
    throw new Error("No tweets data available. Please search tweets first.");
  }

  const tweetsData: Tweet[] = JSON.parse(tweetsDataStr);
  
  console.log("📤 Enviando tweets a clasificar:");
  console.log(`   Total: ${tweetsData.length}`);
  console.log(`   Primer tweet ID: ${tweetsData[0]?.id}`);
  console.log(`   Primer tweet text: ${tweetsData[0]?.text?.substring(0, 50)}...`);

  const response = await fetch(
    `${API_BASE_URL}/api/risk/classify?session_id=${sessionId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tweets: tweetsData,  // ✅ Enviar objetos completos con ID
        max_tweets: maxTweets || null
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Classification failed");
  }

  return await response.json();
};