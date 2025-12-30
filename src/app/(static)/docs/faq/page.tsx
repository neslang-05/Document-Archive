import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function FAQPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Is this platform free to use?</AccordionTrigger>
          <AccordionContent>
            Yes, MTU Academic Archive is completely free for all students of Manipur Technical University.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>How do I upload a resource?</AccordionTrigger>
          <AccordionContent>
            You need to sign in with your account. Once signed in, click on the &quot;Upload Resource&quot; button in the header or dashboard.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Can I delete my uploads?</AccordionTrigger>
          <AccordionContent>
            Currently, you cannot delete uploads directly. Please contact a moderator if you need to remove a resource.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
