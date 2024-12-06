import { Message } from "../model/User";

export interface ApiResponse{
    success: boolean;
    message: string;
    isAcceptatingMessage?:boolean;
    messages ? :Array<Message>
}