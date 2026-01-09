'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-screen flex-col items-center justify-center space-y-4 bg-[#0c1121] text-white">
            <h2 className="text-2xl font-bold">Something went wrong!</h2>
            <p className="text-gray-400 max-w-md text-center">
                We apologize for the inconvenience. An unexpected error has occurred.
            </p>
            <div className="flex gap-4">
                <Button
                    onClick={() => reset()}
                    variant="outline"
                    className="border-white/10 hover:bg-white/5"
                >
                    Try again
                </Button>
                <Button
                    onClick={() => window.location.href = '/'}
                    className="bg-blue-600 hover:bg-blue-500"
                >
                    Return Home
                </Button>
            </div>
        </div>
    );
}
