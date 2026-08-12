"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const cobros_service_1 = require("./cobros.service");
describe('CobrosService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [cobros_service_1.CobrosService],
        }).compile();
        service = module.get(cobros_service_1.CobrosService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=cobros.service.spec.js.map