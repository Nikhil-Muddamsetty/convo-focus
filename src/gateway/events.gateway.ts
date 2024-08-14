import {
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets';

import { Socket } from 'socket.io';
import { PushMessageDto } from 'src/messages/message.dto';
import { MessageService } from 'src/messages/messages.service';
import {
  BadRequestTransformationFilter,
  WsExceptionFilter,
} from 'src/utils/ws-exception.filter';
import { GatewayGuard } from './gateway.gaurd';

@UseGuards(new GatewayGuard())
@WebSocketGateway({
  transport: ['websocket'],
  cors: {
    origin: '*',
  },
})
@UseFilters(new BadRequestTransformationFilter())
@UseFilters(new WsExceptionFilter())
@UsePipes(
  new ValidationPipe({
    transform: true,
    enableDebugMessages: false,
    whitelist: false,
  }),
)
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  // @WebSocketServer()
  // server;

  connectedUsers: Map<string, string> = new Map();

  constructor(private messageService: MessageService) {}

  async afterInit(server: any) {
    // console.log('Init', server);
  }

  async handleConnection(client: Socket): Promise<void> {
    console.log('handleConnection - new connection establised');
  }

  async handleDisconnect(client: Socket) {
    console.log('handleDisconnect - connection closed');
  }

  // @UsePipes(
  //   new ValidationPipe({
  //     transform: true,
  //   }),
  // )
  @SubscribeMessage('pushMessage')
  handlePushMessage(
    client: Socket,
    pushMessageDto: PushMessageDto,
    a,
    b,
    c,
    d,
    e,
  ): void {
    try {
      console.log(a, b, c, d, e);
      this.messageService.createMessage(pushMessageDto);
    } catch (error) {}
  }

  // @UsePipes(
  //   new ValidationPipe({
  //     transform: true,
  //   }),
  // )
  @SubscribeMessage('receiveMessage')
  handleReceiveMessage(client: Socket, addMessageDto: string): string {
    throw new WsException('something man');
    console.log(addMessageDto);
    return addMessageDto;
  }
}
