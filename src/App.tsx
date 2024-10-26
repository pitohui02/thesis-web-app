"use client"

import './App.css'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod";
import { useState } from 'react'


import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import Dashboard from './dashboard'


const FormSchema = z.object({
  SequentialText: z.string().min(1, "Feedback is Required.").max(200)
})

type InputText = z.infer<typeof FormSchema>

export default function App() {

  const [getData, setgetData] = useState<InputText | null>(null)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      SequentialText: ""
    },
  })

  
  const buttonSubmit = (data: InputText) => {
    console.log("Input Text: ", data);
    setgetData(data)
  }

  return(
    <>
      
      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(buttonSubmit)}
          className="flex flex-col space-y-4 bg-slate-100 py-8 px-4 rounded-lg shadow-sm max-w-[40rem]"
        >
        
        <h5 className="font-bold text-xl">Give some Feedback to Mr. Juan Dela Cruz</h5>

        <div className='flex flex-col space-y-5 items-center'>
          <FormField
                control={form.control}
                name="SequentialText"
                render={({ field }) => (
                  <FormItem>
                    <FormMessage className="text-xs"/>
                    <FormControl>
                      <Input
                        placeholder="Feedback..."
                        className="rounded-lg w-[30rem]"
                        {...field}
                      />
                    </FormControl>
                    
                  </FormItem>
                )}
              />
          
          <Button
              type="submit"
              variant="outline"
              className="bg-[#8EABC9] hover:bg-[#C2D3E4] w-[30rem]"
            >
            Submit
          </Button>

          <h3 className='font-bold text-l self-start'>Sentiment: </h3>
          
          <Dialog>
            <DialogTrigger>
              <Button
                type="button"
                variant="outline"
                className="bg-[#8EABC9] hover:bg-[#C2D3E4] w-[30rem]"
              >
              Check Graph
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-[100rem] min-h-[40rem] bg-[#f5f5f5]'>
              <Dashboard data={getData}/>
            </DialogContent>
          </Dialog>
        </div>

        </form>
      </Form>

      
    </>
  )
}
