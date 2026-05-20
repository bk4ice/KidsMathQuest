import React, { useState, useEffect, useCallback } from 'react';

export interface TypewriterProps {
  children: React.ReactNode;
  speed?: number;
  trigger?: any;
  autoPlay?: boolean;
  onDone?: () => void;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  children,
  speed = 90,
  trigger,
  autoPlay = true,
  onDone,
}) => {
  const [displayText, setDisplayText] = useState<React.ReactNode[]>([]);
  const [isDone, setIsDone] = useState(false);

  const extractText = useCallback((node: React.ReactNode): string => {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(extractText).join('');
    if (React.isValidElement(node) && node.props.children) {
      return extractText(node.props.children);
    }
    return '';
  }, []);

  const renderTruncated = useCallback((node: React.ReactNode, count: { value: number }): React.ReactNode => {
    if (count.value <= 0) return null;

    if (typeof node === 'string' || typeof node === 'number') {
      const str = String(node);
      const slice = str.slice(0, count.value);
      count.value -= str.length;
      return slice;
    }

    if (Array.isArray(node)) {
      return node.map((child, i) => <React.Fragment key={i}>{renderTruncated(child, count)}</React.Fragment>);
    }

    if (React.isValidElement(node)) {
      const children = node.props.children;
      return React.cloneElement(node as React.ReactElement<any>, {
        key: node.key,
        children: renderTruncated(children, count),
      });
    }

    return null;
  }, []);

  useEffect(() => {
    if (!autoPlay) {
      setDisplayText([children]);
      setIsDone(true);
      onDone?.();
      return;
    }

    const fullText = extractText(children);
    let currentCount = 0;
    setIsDone(false);

    const timer = setInterval(() => {
      currentCount++;
      const truncated = renderTruncated(children, { value: currentCount });
      setDisplayText([truncated]);

      if (currentCount >= fullText.length) {
        clearInterval(timer);
        setIsDone(true);
        onDone?.();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [children, speed, trigger, autoPlay, extractText, renderTruncated, onDone]);

  return <>{displayText}</>;
};
