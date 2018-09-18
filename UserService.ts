import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';

import { Logger, LoggerInterface } from '../../decorators/Logger';
import { User } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';
import * as Faker from 'faker';
import { ObjectId } from 'mongodb';
import { ProductService } from './ProductService';
import { env } from '../../env';

@Service()
export class UserService {

    constructor(
        @OrmRepository() private userRepository: UserRepository,
        @Logger(__filename) private log: LoggerInterface,
        private productService: ProductService
    ) { }

    public find(params: object): Promise<User[]> {
        const query = Object.keys(params).length > 0 ? { where: params } : {};
        this.log.info('Find all users');
        return this.userRepository.find(query);
    }

    public findOne(id: string): Promise<User | undefined> {
        this.log.info('Find user by id users');
        return this.userRepository.findOne( id );
    }

    public async create(user: User): Promise<User> {
        this.log.info('Create a new user');
        const newUser = this.createAndFillUserModel(user);
        return this.userRepository.save(newUser);
    }

    public findOneByTwitchId(twitchId: number): Promise<User | undefined> {
        this.log.info(`Find user by twitch id: ${twitchId}`);
        return this.userRepository.findOne({ twitchId });
    }

    public update(id: string, user: User): Promise<User> {
        this.log.info('Update a user');
        const updatedUser = this.createAndFillUserModel(user);
        updatedUser._id = new ObjectId(id);
        return this.userRepository.save(updatedUser);
    }

    public async delete(id: string): Promise<void> {
        this.log.info('Delete a user');
        await this.userRepository.delete(id);
        return;
    }

    public async findOrCreateTwitchUser(twitchUserId: number): Promise<User | undefined> {
        const user = await this.findOneByTwitchId(twitchUserId);

        if (user) {
            return user;
        }

        const userName = Faker.random.arrayElement(env.randomNames) + Faker.random.number().toString();

        const newUser = this.createAndFillUserModel({
            name: userName,
            twitchId: twitchUserId,
            password: Faker.random.number().toString(),
            email: userName,
            thumbnail: await this.productService.getRandomAvatar(),
            isRandom: false,
            twitchChannel: '',
            type: 'registered',
            facebookId: '',
        });

        return this.userRepository.save(newUser);
    }
}
