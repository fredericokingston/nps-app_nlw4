import { Request, Response } from 'express';
import { resolve } from 'path';
import { getCustomRepository } from "typeorm";
import { AppError } from "../errors/AppError";
import { SurveysRepository } from "../repositories/SurveysRepository";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";
import { UsersRepository } from "../repositories/UsersRepository";
import SendMailService from '../services/SendMailService';

class SendMailController {

    async execute(request: Request, response: Response) {
        const { email, survey_id } = request.body;
        
        const usersRepository = getCustomRepository(UsersRepository);
        const surveysRepository = getCustomRepository(SurveysRepository);
        const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

        const user = await usersRepository.findOne({email});

        if (! user) {
            throw new AppError("User does not exists");
        }

        const survey = await surveysRepository.findOne({id: survey_id});

        if (! survey) {
            throw new AppError("Survey does not exists");
        }

        const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
            where: {user_id: user.id, value: null, survey_id: survey_id},
            relations: ["user", "survey"]
        });

        const variables = {
            name: user.name,
            title: survey.title,
            description: survey.description,
            id:"",
            link: process.env.URL_MAIL,
        }

        const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs");

        if (surveyUserAlreadyExists) {
            variables.id = surveyUserAlreadyExists.id;

            await SendMailService.execute(email, survey.title, variables, npsPath);
            return response.json(surveyUserAlreadyExists);
        }
        
        //Salvar as informações na tabela surveys_users
        const surveyUser = surveysUsersRepository.create({
            user_id: user.id,
            survey_id,
        })
        await surveysUsersRepository.save(surveyUser);
        variables.id = surveyUserAlreadyExists.id;

        //Enviar email para o usuário    

        await SendMailService.execute(email, survey.title, variables, npsPath);

        return response.json(surveyUser);

    }


}

export { SendMailController };
