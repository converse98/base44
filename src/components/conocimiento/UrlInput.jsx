import React, { useState } from 'react';
import { DataSource } from "@/api/entities";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Link, Loader2 } from "lucide-react";

export default function UrlInput({ onDataSourceAdded }) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddUrl = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL.');
      return;
    }
    // Basic URL validation
    try {
      new URL(url);
    } catch (_) {
      setError('The provided text is not a valid URL.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await DataSource.create({
        name: url,
        source_type: 'web_url',
        format: 'url',
        url: url,
        size: 0,
        status: 'uploaded',
      });
      setUrl('');
      onDataSourceAdded();
    } catch (err) {
      console.error("Failed to add URL:", err);
      setError('Could not save the URL. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-600">
        Añada URLs externas como fuente de datos para web scraping.
      </p>
      <div className="flex gap-2">
        <div className="relative flex-grow">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError('');
            }}
            className="pl-9"
          />
        </div>
        <Button onClick={handleAddUrl} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Añadir
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}