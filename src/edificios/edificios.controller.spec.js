"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const edificios_controller_1 = require("./edificios.controller");
describe('EdificiosController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [edificios_controller_1.EdificiosController],
        }).compile();
        controller = module.get(edificios_controller_1.EdificiosController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=edificios.controller.spec.js.map