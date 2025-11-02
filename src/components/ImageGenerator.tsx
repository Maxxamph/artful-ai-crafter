import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

export const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt },
      });

      if (error) {
        console.error("Error generating image:", error);
        toast.error(error.message || "Failed to generate image");
        return;
      }

      if (data?.imageUrl) {
        const newImage: GeneratedImage = {
          url: data.imageUrl,
          prompt,
          timestamp: Date.now(),
        };
        setGeneratedImages((prev) => [newImage, ...prev]);
        toast.success("Image generated successfully!");
        setPrompt("");
      } else {
        toast.error("No image URL received");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (imageUrl: string, prompt: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${prompt.slice(0, 30).replace(/[^a-z0-9]/gi, "_")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image downloaded!");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-card p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            AI Image Generator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your ideas into stunning visuals with the power of AI
          </p>
        </div>

        {/* Input Section */}
        <Card className="p-8 bg-card/50 backdrop-blur-sm border-border shadow-card">
          <div className="space-y-4">
            <label htmlFor="prompt" className="text-lg font-semibold text-foreground">
              Describe your image
            </label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A majestic dragon flying over a futuristic city at sunset..."
              className="min-h-32 text-lg bg-background border-border focus:ring-primary"
              disabled={isGenerating}
            />
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-semibold py-6 text-lg shadow-glow transition-all duration-300"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Image
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Gallery */}
        {generatedImages.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Your Creations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedImages.map((image, index) => (
                <Card
                  key={image.timestamp}
                  className="group overflow-hidden bg-card/50 backdrop-blur-sm border-border hover:shadow-glow transition-all duration-300"
                >
                  <div className="relative aspect-square">
                    <img
                      src={image.url}
                      alt={image.prompt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <div className="w-full space-y-3">
                        <p className="text-sm text-foreground line-clamp-2">{image.prompt}</p>
                        <Button
                          onClick={() => handleDownload(image.url, image.prompt)}
                          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                          size="sm"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {generatedImages.length === 0 && !isGenerating && (
          <Card className="p-12 text-center bg-card/30 backdrop-blur-sm border-border border-dashed">
            <Sparkles className="h-16 w-16 mx-auto mb-4 text-primary opacity-50" />
            <p className="text-xl text-muted-foreground">
              Your generated images will appear here
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
