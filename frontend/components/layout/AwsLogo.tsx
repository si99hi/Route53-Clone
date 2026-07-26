'use client';

import React from 'react';
import Image from 'next/image';
import awsLogoPic from '../../public/aws-logo.png';

interface AwsLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'orange';
  height?: number | string;
  width?: number | string;
}

export default function AwsLogo({
  className = 'h-7 w-auto',
  variant = 'light',
  height,
  width,
}: AwsLogoProps) {
  return (
    <Image
      src={awsLogoPic}
      alt="AWS Logo"
      priority
      className={`${className} inline-block shrink-0 align-middle select-none object-contain ${
        variant === 'dark' ? 'brightness-0 invert' : ''
      }`}
      style={{ height, width }}
    />
  );
}





