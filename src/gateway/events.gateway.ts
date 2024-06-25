import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';

import { Socket } from 'socket.io';
import { PushMessageDto } from 'src/messages/message.dto';
import { MessageService } from 'src/messages/messages.service';

@UsePipes(new ValidationPipe())
@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    // @WebSocketServer()
    // server;

    connectedUsers: Map<string, string> = new Map();

    constructor(private messageService: MessageService) { }

    async afterInit(server: any) {
        console.log('Init', server);
    }

    async handleConnection(client: Socket): Promise<void> {
        console.log('handleConnection', client);
    }

    async handleDisconnect(client: Socket) {
        console.log('handleDisconnect', client);
    }

    @SubscribeMessage('pushMessage')
    handlePushMessage(client: Socket, pushMessageDto: PushMessageDto): void {
        console.log(
            pushMessageDto
        );
        this.messageService.pushNewMessage(pushMessageDto);

    }

    @SubscribeMessage('receiveMessage')
    handleReceiveMessage(client: Socket, addMessageDto: string): string {
        console.log(
            addMessageDto
        );
        return addMessageDto
    }

}