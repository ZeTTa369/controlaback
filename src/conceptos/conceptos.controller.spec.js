"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const conceptos_controller_1 = require("./conceptos.controller");
describe('ConceptosController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [conceptos_controller_1.ConceptosController],
        }).compile();
        controller = module.get(conceptos_controller_1.ConceptosController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=conceptos.controller.spec.js.map