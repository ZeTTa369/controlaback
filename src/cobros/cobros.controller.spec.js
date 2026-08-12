"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const cobros_controller_1 = require("./cobros.controller");
describe('CobrosController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [cobros_controller_1.CobrosController],
        }).compile();
        controller = module.get(cobros_controller_1.CobrosController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=cobros.controller.spec.js.map