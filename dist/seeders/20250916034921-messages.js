'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
module.exports = {
    up(queryInterface, Sequelize) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryInterface.bulkInsert('Messages', [
                {
                    text: 'Hablame sobre Toyota Corolla',
                    role: 'client',
                    sentAt: new Date(),
                    clientId: 1,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    text: 'Hablame sobre Chevrolet Onix',
                    role: 'client',
                    sentAt: new Date(new Date().setDate(new Date().getDate() - 8)),
                    clientId: 2,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
            ], {});
        });
    },
    down(queryInterface, Sequelize) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryInterface.bulkDelete('Messages', null, {});
        });
    }
};
