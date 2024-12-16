'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CardHeader, CardContent, Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import * as z from 'zod';
import { ApiResponse } from '@/types/ApiResponse';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { messageSchema } from '@/schemas/messageSchema';

const specialChar = '||';

const DEFAULT_MESSAGES = [
  "What's your dream job?", 
  "Do you have any pets?", 
  "What's your favorite movie?"
];

const parseStringMessages = (messageString: string): string[] => {
  return messageString.split(specialChar);
};

export default function SendMessage() {
  const params = useParams<{ username: string }>();
  const username = params.username;
  
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>(DEFAULT_MESSAGES);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState('');

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const messageContent = form.watch('content');

  const handleMessageClick = (message: string) => {
    form.setValue('content', message);
  };

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>('/api/send-message', {
        ...data,
        username,
      });

      toast({
        title: response.data.message,
        variant: 'default',
      });
      form.reset({ ...form.getValues(), content: '' });
    } catch (error) {
      const axiosError = error as any;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestedMessages = async () => {
    setIsSuggestLoading(true);
    setSuggestError('');
    try {
      const response = await axios.post('/api/suggest-message');
      const messages = parseStringMessages(response.data.output || '');
      setSuggestedMessages(messages);
    } catch (error: any) {
      setSuggestError(error.response?.data?.message || 'Failed to fetch suggestions');
    } finally {
      setIsSuggestLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-center">
        Public Profile Link
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">Send Anonymous Message to @{username}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your anonymous message here"
                    className="resize-none w-full text-sm sm:text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs sm:text-sm" />
              </FormItem>
            )}
          />
          <div className="flex justify-center">
            {isLoading ? (
              <Button disabled className="w-full sm:w-auto">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isLoading || !messageContent} 
                className="w-full sm:w-auto"
              >
                Send It
              </Button>
            )}
          </div>
        </form>
      </Form>

      <div className="space-y-4 my-6 sm:my-8">
        <div className="space-y-2">
          <Button
            onClick={fetchSuggestedMessages}
            className="w-full sm:w-auto my-4"
            disabled={isSuggestLoading}
          >
            {isSuggestLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading suggestions...
              </>
            ) : (
              'Suggest Messages'
            )}
          </Button>
          <p className="text-sm text-center sm:text-left">Click on any message below to select it.</p>
        </div>
        <Card className="w-full">
          <CardHeader>
            <h3 className="text-lg sm:text-xl font-semibold">Messages</h3>
          </CardHeader>
          <CardContent className="flex flex-col space-y-2 sm:space-y-4">
            {suggestError ? (
              <p className="text-red-500 text-sm sm:text-base">{suggestError}</p>
            ) : (
              suggestedMessages.map((message, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full text-xs sm:text-sm"
                  onClick={() => handleMessageClick(message)}
                >
                  {message}
                </Button>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      <Separator className="my-4 sm:my-6" />
      <div className="text-center">
        <div className="mb-4 text-sm sm:text-base">Get Your Message Board</div>
        <Link href={'/sign-up'}>
          <Button className="w-full sm:w-auto">Create Your Account</Button>
        </Link>
      </div>
    </div>
  );
}