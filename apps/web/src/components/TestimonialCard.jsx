
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

const TestimonialCard = ({ quote, author, role, company }) => {
  return (
    <Card className="h-full bg-primary text-primary-foreground border-none">
      <CardContent className="p-8 flex flex-col h-full">
        <Quote className="w-10 h-10 text-primary-foreground/20 mb-6" />
        <p className="text-lg leading-relaxed mb-8 flex-1">"{quote}"</p>
        <div>
          <p className="font-semibold">{author}</p>
          <p className="text-primary-foreground/80 text-sm">{role}{company ? `, ${company}` : ''}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;
