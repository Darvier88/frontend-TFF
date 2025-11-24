import { Divider } from "@mui/material"; 

import { Navbar } from "./Navbar/Navbar"; 
import { Footer } from "./Footer/Footer"; 
import { Faq} from "./FAQ/FAQ"; 
import {Testimonials} from "./Testimonials/Testimonials"; 
import {Pricing} from "./Pricing/Pricing"; 
import VideoBlock from "./Video-Block/Video-Block"; 
import Features from "./Features/Features"; 
import Hero from "./Hero/Hero"; 

export default function BackgroundCheckerLanding() 
{ 
    return ( 
        <> 
            <Navbar /> 
            <Hero /> 
            <Features /> 
            <Divider /> 
            <VideoBlock /> 
            <Divider /> 
            <Pricing /> 
            <Divider /> 
            <Testimonials /> 
            <Divider /> 
            <Faq id="faqs" /> 
            <Footer /> 
        </> 
    ); 
}