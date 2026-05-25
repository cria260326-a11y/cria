
import React from 'react';

const TimelineStep = ({ step, title, description, icon: Icon, isLast }) => {
  return (
    <div className="relative flex gap-6 pb-12">
      {!isLast && (
        <div className="absolute left-6 top-14 bottom-0 w-px bg-border -translate-x-1/2" />
      )}
      <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border-4 border-background">
        {Icon ? <Icon className="w-5 h-5" /> : step}
      </div>
      <div className="pt-2">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default TimelineStep;
