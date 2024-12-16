'use client';

import { MessageCard } from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/model/User';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Copy, Loader2, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { acceptMessageSchema } from '@/schemas/acceptMessageSchema';



function UserDashboard(){

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const { toast } = useToast();

  const handleDeleteMessage = (messageId : string)=>{
        setMessages(messages.filter((message)=> message._id!== messageId));
  };

  const{data:session}=useSession();

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema),
  });

  const{register,watch,setValue}=form

  const acceptMessages = watch('acceptMessages');

  const fetchAcceptMessages = useCallback(async()=>{
    
    setIsSwitchLoading(true);

    try {
      
      const response = await axios.get<ApiResponse>('/api/accept-message');
      setValue('acceptMessages', response.data.isAcceptingMessage);
    } catch (error) {
      
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ??
          'Failed to fetch message settings',
        variant: 'destructive',
      });
    } finally {
      setIsSwitchLoading(false);
    }

  },[setValue,toast]);


  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      setIsSwitchLoading(false);
      try {
        const response = await axios.get<ApiResponse>('/api/get-messages');
        setMessages(response.data.messages || []);
        if (refresh) {
          toast({
            title: 'Refreshed Messages',
            description: 'Showing latest messages',
          });
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast({
          title: 'Error',
          description:
            axiosError.response?.data.message ?? 'Failed to fetch messages',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
        setIsSwitchLoading(false);
      }
    },
    [setIsLoading, setMessages, toast]
  );

   // Fetch initial state from the server
   useEffect(() => {
    if (!session || !session.user) return;

    fetchMessages();

    fetchAcceptMessages();
  }, [session, setValue, toast, fetchAcceptMessages, fetchMessages]);


  // Handle switch change
  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/accept-message', {
        acceptMessages: !acceptMessages,
      });
      setValue('acceptMessages', !acceptMessages);
      toast({
        title: response.data.message,
        variant: 'default',
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ??
          'Failed to update message settings',
        variant: 'destructive',
      });
    }
  };

  if (!session || !session.user) {
    return <div></div>;
  }

  const { username } = session.user as User;

  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: 'URL Copied!',
      description: 'Profile URL has been copied to clipboard.',
    });
  };


  return (
    <div className="my-4 mx-2 sm:my-8 sm:mx-4 md:mx-8 lg:mx-auto p-4 sm:p-6 bg-white rounded-lg w-full max-w-6xl">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-center">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-base sm:text-lg font-semibold mb-2">Copy Your Unique Link</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <input
            type="text"
            value={profileUrl}
            readOnly
            className="input input-bordered w-full p-2 text-sm sm:text-base truncate"
          />
          <Button 
            onClick={copyToClipboard} 
            className="w-full sm:w-auto flex items-center justify-center"
          >
            <Copy className="mr-2 h-4 w-4" /> Copy
          </Button>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-start">
        <Switch
          {...register('acceptMessages')}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2 text-sm sm:text-base">
          Accept Messages: {acceptMessages ? 'On' : 'Off'}
        </span>
      </div>
      
      <Separator className="my-4" />

      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            fetchMessages(true);
          }}
          className="flex items-center"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCcw className="h-4 w-4 mr-2" />
          )}
          Refresh Messages
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageCard
              key={message._id}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">No messages to display.</p>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;