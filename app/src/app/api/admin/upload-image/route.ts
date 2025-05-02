import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createServiceRoleClient, createServerClientWithToken } from '@/utils/supabaseServer';
import { randomUUID } from 'crypto';
import { Buffer } from 'buffer';

// Ensure environment variables are loaded and available
const R2_ENDPOINT = `https://356d0914e36848654a2e4cec4e915a9c.r2.cloudflarestorage.com`;
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!;
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL!;
const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID!;

if (!R2_ENDPOINT || !R2_BUCKET_NAME || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_PUBLIC_URL || !R2_ACCOUNT_ID) {
    console.error("Missing Cloudflare R2 environment variables");
}

export async function POST(req: NextRequest) {
    try {
        // Extract the authorization header
        const authHeader = req.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.error('Auth error in upload-image: No valid authorization header');
            return new NextResponse(JSON.stringify({ error: 'Unauthorized: Invalid or missing auth token' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }
        
        // Get the token from the Authorization header
        const token = authHeader.split(' ')[1];
        
        // Create Supabase client with the auth token
        const supabase = createServerClientWithToken(token);

        // 1. Check Authentication & Authorization
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            console.error("API Auth Error:", authError);
            return new NextResponse(JSON.stringify({ error: 'Unauthorized: User not authenticated' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }

        // Fetch user profile to check role
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            console.error("API Profile Error:", profileError);
            return new NextResponse(JSON.stringify({ error: 'Failed to retrieve user profile or profile not found.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        // Debug the actual role value
        console.log('User role in database (upload-image):', profile?.role);
        
        // Use case-insensitive comparison for role check
        if (!profile?.role || 
            !(profile.role.toUpperCase() === 'ADMIN' || 
              profile.role === 'admin')) {
            console.warn(`User ${user.id} with role "${profile?.role}" attempted admin action without privileges.`);
            return new NextResponse(JSON.stringify({ error: 'Forbidden: Requires admin privileges.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
        }

        // 2. Get file info based on content type
        // Check content type to determine how to handle the request
        const requestContentType = req.headers.get('content-type') || '';
        console.log('Request Content-Type:', requestContentType);

        // Check if we have a JSON request or a multipart form data request
        if (requestContentType.includes('application/json')) {
            // Handle JSON submission (pre-signed URL approach)
            try {
                const json = await req.json();
                
                if (!json.filename || !json.contentType) {
                    return new NextResponse(JSON.stringify({ error: 'Filename and contentType are required.' }), 
                        { status: 400, headers: { 'Content-Type': 'application/json' } });
                }
                
                // Generate Unique Filename with UUID
                const uniqueFilename = `${randomUUID()}-${json.filename.replace(/\s+/g, '_')}`;
                
                // Create S3 client for R2
                const s3Client = new S3Client({
                    region: 'auto', // Region is "auto" for Cloudflare R2
                    endpoint: R2_ENDPOINT,
                    credentials: {
                        accessKeyId: R2_ACCESS_KEY_ID,
                        secretAccessKey: R2_SECRET_ACCESS_KEY,
                    },
                });
                
                // Create parameters for the PutObject command
                const command = new PutObjectCommand({
                    Bucket: R2_BUCKET_NAME,
                    Key: uniqueFilename,
                    ContentType: json.contentType,
                });
                
                // Generate pre-signed URL (valid for 60 minutes)
                const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
                
                // Return both the public URL and the pre-signed upload URL
                return NextResponse.json({
                    publicUrl: `${R2_PUBLIC_URL}/${uniqueFilename}`,
                    uploadUrl: signedUrl,
                    fileName: uniqueFilename,
                });
            } catch (error) {
                console.error('Error processing JSON request:', error);
                return new NextResponse(JSON.stringify({ error: 'Invalid JSON format' }), 
                    { status: 400, headers: { 'Content-Type': 'application/json' } });
            }
        } else {
            // Handle multipart form submission
            try {
                // Get formData - this will throw if content-type is not multipart/form-data
                console.log('Attempting to parse form data...');
                const formData = await req.formData();
                  // Get file from form data
                const file = formData.get('file');
                console.log('File from formData:', file ? 'Found' : 'Not found');
                
                // Debug the file object in detail
                if (file) {
                    console.log('File details:', {
                        type: typeof file,
                        constructor: file.constructor?.name || 'unknown',
                        hasSize: 'size' in file,
                        size: file.size,
                        hasType: 'type' in file,
                        fileType: file.type,
                        hasName: 'name' in file,
                        fileName: 'name' in file ? file.name : 'N/A',
                        hasArrayBuffer: 'arrayBuffer' in file && typeof file.arrayBuffer === 'function'
                    });
                }
                
                // Check if file exists and has required properties
                if (!file || typeof file !== 'object' || !('arrayBuffer' in file) || typeof file.arrayBuffer !== 'function') {
                    return new NextResponse(JSON.stringify({ error: 'No valid file provided in form data or file object is missing required methods' }), 
                        { status: 400, headers: { 'Content-Type': 'application/json' } });
                }
                
                // Get filename from form data or use file.name
                const filename = (formData.get('filename') as string) || (file instanceof File ? file.name : 'uploaded-file');
                const contentType = file.type || 'application/octet-stream';
                
                console.log('Processing file upload:', filename, 'Type:', contentType, 'Size:', file.size);
                
                // Generate a unique filename
                const uniqueFilename = `${randomUUID()}-${filename.replace(/\s+/g, '_')}`;
                
                try {
                    // Create S3 client
                    const s3Client = new S3Client({
                        region: 'auto',
                        endpoint: R2_ENDPOINT,
                        credentials: {
                            accessKeyId: R2_ACCESS_KEY_ID,
                            secretAccessKey: R2_SECRET_ACCESS_KEY,
                        },
                    });
                    
                    // Convert file to buffer
                    const arrayBuffer = await file.arrayBuffer();
                    const fileBuffer = Buffer.from(arrayBuffer);
                    
                    console.log('File converted to buffer, size:', fileBuffer.length);
                    
                    // Upload file to R2
                    const uploadCommand = new PutObjectCommand({
                        Bucket: R2_BUCKET_NAME,
                        Key: uniqueFilename,
                        Body: fileBuffer,
                        ContentType: contentType,
                    });
                    
                    console.log('Sending upload to R2...');
                    const uploadResult = await s3Client.send(uploadCommand);
                    console.log('Upload completed, result:', uploadResult);
                    
                    // Return the public URL
                    const publicUrl = `${R2_PUBLIC_URL}/${uniqueFilename}`;
                    return NextResponse.json({
                        success: true,
                        publicUrl,
                        fileName: uniqueFilename,
                    });
                } catch (uploadError) {
                    console.error('Error uploading to R2:', uploadError);
                    return new NextResponse(JSON.stringify({ 
                        error: 'Failed to upload file to storage. Please try again.' 
                    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
                }
            } catch (formError) {
                console.error('Error parsing formData:', formError);
                return new NextResponse(JSON.stringify({ 
                    error: 'Failed to parse form data. Make sure you\'re sending a multipart/form-data request with a file field.' 
                }), { status: 400, headers: { 'Content-Type': 'application/json' } });
            }
        }
    } catch (error) {
        console.error('Unexpected error in upload-image API route:', error);
        return new NextResponse(JSON.stringify({ error: 'An unexpected server error occurred' }), 
            { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
