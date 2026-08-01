import React from 'react';

export const BlogSkeleton = () => (
    <div className="min-h-screen bg-[#F5F2ED] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
            <div className="h-12 bg-gray-200 dark:bg-gray-300 rounded w-1/3 mb-6 animate-pulse"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-300 rounded w-2/3 mb-12 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                        <div className="w-full h-64 bg-gray-200 dark:bg-gray-300 animate-pulse"></div>
                        <div className="p-6">
                            <div className="flex gap-2 mb-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-300 animate-pulse w-1/4 rounded"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-300 animate-pulse w-1/4 rounded"></div>
                            </div>
                            <div className="h-6 bg-gray-200 dark:bg-gray-300 animate-pulse w-3/4 rounded mb-4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-300 animate-pulse w-full rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-300 animate-pulse w-5/6 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const BlogPostSkeleton = () => (
    <div className="min-h-screen bg-[#F5F2ED] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
            <div className="flex gap-4 mb-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-300 animate-pulse w-24 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-300 animate-pulse w-32 rounded"></div>
            </div>
            <div className="h-12 bg-gray-200 dark:bg-gray-300 animate-pulse w-full rounded mb-8"></div>
            <div className="w-full h-[400px] bg-gray-200 dark:bg-gray-300 animate-pulse rounded-2xl mb-8"></div>
            <div className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-300 animate-pulse w-full rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-300 animate-pulse w-full rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-300 animate-pulse w-5/6 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-300 animate-pulse w-full rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-300 animate-pulse w-4/5 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-300 animate-pulse w-full rounded"></div>
            </div>
        </div>
    </div>
);

export const PolicySkeleton = () => (
    <div className="min-h-screen bg-[#F5F2ED] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
            <div className="mb-12">
                <div className="h-10 bg-gray-200 dark:bg-gray-300 animate-pulse w-1/3 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-300 animate-pulse w-1/4 rounded"></div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm space-y-8">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="space-y-4">
                        <div className="h-6 bg-gray-200 dark:bg-gray-300 animate-pulse w-1/4 rounded"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-300 animate-pulse w-full rounded"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-300 animate-pulse w-full rounded"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-300 animate-pulse w-5/6 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const DashboardSkeleton = () => (
    <div className="min-h-screen bg-[#F5F2ED] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div className="h-8 bg-gray-200 dark:bg-gray-300 animate-pulse w-1/4 rounded"></div>
                <div className="h-10 w-24 bg-gray-200 dark:bg-gray-300 animate-pulse rounded-lg"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-300 animate-pulse rounded-full"></div>
                            <div className="space-y-2 flex-grow">
                                <div className="h-4 bg-gray-200 dark:bg-gray-300 animate-pulse w-1/2 rounded"></div>
                                <div className="h-6 bg-gray-200 dark:bg-gray-300 animate-pulse w-1/3 rounded"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-white rounded-2xl h-64 bg-gray-200 dark:bg-gray-300 animate-pulse"></div>
        </div>
    </div>
);

export const FormSkeleton = () => (
    <div className="min-h-[100svh] bg-[#F5F2ED] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
            <div className="mb-8 text-center">
                <div className="h-8 bg-gray-200 dark:bg-gray-300 animate-pulse w-1/2 rounded mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-300 animate-pulse w-2/3 rounded mx-auto"></div>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-sm">
                <div className="h-2 w-full bg-gray-100 rounded-full mb-8 overflow-hidden">
                    <div className="h-full bg-gray-200 dark:bg-gray-300 animate-pulse w-1/4"></div>
                </div>
                <div className="space-y-6">
                    <div className="h-6 bg-gray-200 dark:bg-gray-300 animate-pulse w-1/3 rounded mb-4"></div>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 w-full bg-gray-200 dark:bg-gray-300 animate-pulse rounded-xl"></div>
                    ))}
                </div>
                <div className="mt-8 flex justify-between">
                    <div className="h-12 w-24 bg-gray-200 dark:bg-gray-300 animate-pulse rounded-full"></div>
                    <div className="h-12 w-24 bg-gray-200 dark:bg-gray-300 animate-pulse rounded-full"></div>
                </div>
            </div>
        </div>
    </div>
);

export const FooterSkeleton = () => (
    <div className="w-full h-64 bg-[#1A1A1A] animate-pulse"></div>
);

export const GenericSectionSkeleton = () => (
    <div className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F5F2ED] w-full">
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center mb-16 text-center">
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-300 animate-pulse rounded-full mb-6"></div>
                <div className="h-12 w-full max-w-lg bg-gray-200 dark:bg-gray-300 animate-pulse rounded-2xl mb-4"></div>
                <div className="h-4 w-64 bg-gray-200 dark:bg-gray-300 animate-pulse rounded"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className="aspect-[4/5] bg-gray-200 dark:bg-gray-300 animate-pulse rounded-[2rem]"></div>
                ))}
            </div>
        </div>
    </div>
);

export const MenuSkeleton = () => (
    <div className="py-24 px-4 sm:px-6 lg:px-8 bg-white w-full">
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center mb-16 text-center mt-20">
                <div className="h-10 w-96 bg-gray-200 dark:bg-gray-300 animate-pulse rounded-xl mb-4"></div>
                <div className="h-4 w-64 bg-gray-200 dark:bg-gray-300 animate-pulse rounded mb-8"></div>
                <div className="flex space-x-4 mb-12">
                   {[1, 2, 3, 4].map(i => (
                       <div key={i} className="h-10 w-24 bg-gray-200 dark:bg-gray-300 animate-pulse rounded-full"></div>
                   ))}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full animate-pulse">
                        <div className="aspect-[4/3] w-full bg-gray-200 dark:bg-gray-300 relative"></div>
                        <div className="p-6 flex-grow flex flex-col justify-between">
                            <div>
                                <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-300 rounded mb-2"></div>
                                <div className="h-4 w-full bg-gray-200 dark:bg-gray-300 rounded"></div>
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                                <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-300 rounded"></div>
                                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-300 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const ArticleSkeleton = () => (
    <div className="min-h-screen bg-[#F5F2ED] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
            <div className="h-16 bg-gray-200 dark:bg-gray-300 animate-pulse w-3/4 rounded mb-8"></div>
            <div className="w-full h-[500px] bg-gray-200 dark:bg-gray-300 animate-pulse rounded-3xl mb-12"></div>
            <div className="space-y-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-3">
                        <div className="h-8 bg-gray-200 dark:bg-gray-300 animate-pulse w-1/3 rounded mb-4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-300 animate-pulse w-full rounded"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-300 animate-pulse w-full rounded"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-300 animate-pulse w-5/6 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
