import { EventSubscriber, On } from 'event-dispatch';

import { Logger } from '../../lib/logger';
import { events } from './events';
import { Order } from '../models/Order';
import { Socket } from '../../lib/socketIO/Socket';
import { Container } from 'typedi';

const log = new Logger(__filename);

@EventSubscriber()
export class OrderEventSubscriber {
    @On(events.order.created)
    public onOrderCreate(order: Order): void {
        log.info(`Order ${order._id} created!`);

        if (order.type === 'demo') {
            Container.get(Socket).emit(`S_${order.streamerPageName}`, {
                messageType: 'getUserMessageForRoom',
                userMessage: order.userMessage,
                username: order.userDetails.name,
                productLevel: order.itemDetails.productLevel,
                animated: order.itemDetails.animated,
                userId: order.userId,
                item: order.itemDetails,
                orderId: order._id,
            });
        }
    }
}
