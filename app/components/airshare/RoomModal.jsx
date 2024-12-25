"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function RoomModal({ roomId, isVisible, onClose, onJoinRoom }) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState("");
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      toast({
        title: "Copied!",
        description: "Room ID copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (!joinRoomId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a room ID",
        variant: "destructive",
      });
      return;
    }
    onJoinRoom(joinRoomId.trim());
    setJoinRoomId(''); // Reset input after submission
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="w-full"
        >
          <Card className="p-6 shadow-lg">
            <div className="space-y-6">
              {roomId ? (
                <>
                  <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-bold">Your Room is Ready!</h2>
                    <p className="text-muted-foreground">
                      Share this room ID with others to connect
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      value={roomId}
                      readOnly
                      className="text-center font-mono text-lg"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={copyToClipboard}
                    >
                      {copySuccess ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-bold">Join a Room</h2>
                    <p className="text-muted-foreground">
                      Enter a room ID to connect
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Input
                      placeholder="Enter Room ID"
                      value={joinRoomId}
                      onChange={(e) => setJoinRoomId(e.target.value)}
                    />
                    <Button
                      className="w-full"
                      onClick={handleJoinSubmit}
                    >
                      Join Room
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 