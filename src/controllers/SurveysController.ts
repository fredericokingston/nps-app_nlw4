import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { SurveysRepository } from "../repositories/SurveysRepository";


class SurveysController {
    
    async create(request: Request, response: Response) {
        const { title, description } = request.body;

        const surveyRepossitory = getCustomRepository(SurveysRepository);

        const survey = surveyRepossitory.create({
            title,
            description,
        });

        await surveyRepossitory.save(survey);

        return response.status(201).json(survey);
    }

    async show (request: Request, response: Response) {

        const surveyRepossitory = getCustomRepository(SurveysRepository);

        const all = await surveyRepossitory.find();

        return response.json(all);
    };

}

export { SurveysController }