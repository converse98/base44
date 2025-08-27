import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, Check, X } from "lucide-react";
import { format } from "date-fns";

export default function CommentSystem({ blockId, comments, onAddComment }) {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    onAddComment(blockId, newComment, { x: 0, y: 0 });
    setNewComment("");
    setShowCommentForm(false);
    setShowComments(true);
  };

  return (
    <div className="absolute top-4 right-4">
      {/* Comment Button */}
      <div className="flex items-center gap-2">
        {comments.length > 0 && (
          <Badge 
            className="comment-badge text-white cursor-pointer"
            onClick={() => setShowComments(!showComments)}
          >
            {comments.length}
          </Badge>
        )}
        
        <Button
          size="icon"
          variant="outline"
          onClick={() => setShowCommentForm(!showCommentForm)}
          className="bg-white shadow-sm"
          title="Añadir comentario"
        >
          <MessageSquare className="w-4 h-4" />
        </Button>
      </div>

      {/* Comment Form */}
      {showCommentForm && (
        <Card className="absolute top-12 right-0 w-80 p-4 shadow-lg z-10 bg-white">
          <div className="space-y-3">
            <h4 className="font-medium text-neutral-900">Añadir Comentario</h4>
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Dejar un comentario..."
              className="w-full"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddComment} className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="w-4 h-4 mr-1" />
                Añadir
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowCommentForm(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Comments List */}
      {showComments && comments.length > 0 && (
        <Card className="absolute top-12 right-0 w-80 max-h-96 overflow-y-auto shadow-lg z-10 bg-white">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-neutral-900">Comentarios ({comments.length})</h4>
              <Button size="icon" variant="ghost" onClick={() => setShowComments(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="p-3 bg-neutral-50 rounded-lg border">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-medium text-sm text-neutral-900">
                        {comment.author_name}
                      </span>
                      <span className="text-xs text-neutral-500 ml-2">
                        {format(new Date(comment.created_date), "MMM d, HH:mm")}
                      </span>
                    </div>
                    {!comment.resolved && (
                      <Button size="icon" variant="ghost" className="text-green-600" title="Resolver">
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-neutral-700">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}