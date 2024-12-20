import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let profile;
    switch (user.role) {
      case "PATIENT":
        profile = await prisma.patient.findFirst({
          where: { userId: user.id },
        });
        break;
      case "DOCTOR":
        profile = await prisma.doctor.findFirst({
          where: { userId: user.id },
        });
        break;
      case "PHARMACY":
        profile = await prisma.pharmacy.findFirst({
          where: { userId: user.id },
        });
        break;
    }

    return NextResponse.json({
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      profile,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { avatarUrl, ...profileData } = data;

    // Update user's avatar
    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl },
    });

    let updatedProfile;
    switch (user.role) {
      case "PATIENT":
        updatedProfile = await prisma.patient.update({
          where: { userId: user.id },
          data: {
            ...profileData,
            dateOfBirth: profileData.dateOfBirth
              ? new Date(profileData.dateOfBirth)
              : undefined,
          },
        });
        break;
      case "DOCTOR":
        updatedProfile = await prisma.doctor.update({
          where: { userId: user.id },
          data: {
            name: profileData.name,
            phone: profileData.phone,
            address: profileData.address,
            specialization: profileData.specialization,
            qualification: profileData.qualification,
            experience: profileData.experience,
            about: profileData.about,
            avatarUrl, // Add this line
          },
        });
        break;
      case "PHARMACY":
        updatedProfile = await prisma.pharmacy.update({
          where: { userId: user.id },
          data: {
            name: profileData.name,
            phone: profileData.phone,
            address: profileData.address,
            businessName: profileData.businessName,
            gstin: profileData.gstin,
            location: profileData.location,
            avatarUrl, // Add this line
          },
        });
        break;
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
