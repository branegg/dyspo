import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken, hashPassword } from '@/lib/auth';
import { User } from '@/types';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Brak tokenu autoryzacyjnego' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Brak uprawnień administratora' }, { status: 403 });
    }

    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, hasło i imię są wymagane' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Hasło musi mieć co najmniej 6 znaków' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    const existingUser = await db.collection<User>('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Użytkownik o tym adresie email już istnieje' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser: Omit<User, '_id'> = {
      email,
      name,
      role: 'employee',
      hashedPassword,
      createdAt: new Date(),
    };

    const result = await db.collection<User>('users').insertOne(newUser as User);

    return NextResponse.json(
      { message: 'Pracownik został utworzony', userId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create employee error:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Brak tokenu autoryzacyjnego' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Brak uprawnień administratora' }, { status: 403 });
    }

    const db = await getDatabase();

    const employees = await db.collection<User>('users')
      .find({ role: 'employee' })
      .project({ hashedPassword: 0 })
      .toArray();

    return NextResponse.json({ employees });
  } catch (error) {
    console.error('Get employees error:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Brak tokenu autoryzacyjnego' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Brak uprawnień administratora' }, { status: 403 });
    }

    const { userId, email, name, password } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'ID użytkownika jest wymagane' }, { status: 400 });
    }

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Nieprawidłowe ID użytkownika' }, { status: 400 });
    }

    const db = await getDatabase();

    // Check if user exists
    const user = await db.collection<User>('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ error: 'Użytkownik nie istnieje' }, { status: 404 });
    }

    // Build update object
    const updateData: any = {};

    if (name !== undefined && name.trim()) {
      updateData.name = name.trim();
    }

    if (email !== undefined && email.trim()) {
      // Check if email is already taken by another user
      const existingUser = await db.collection<User>('users').findOne({
        email: email.trim(),
        _id: { $ne: new ObjectId(userId) }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Ten adres email jest już używany przez innego użytkownika' },
          { status: 409 }
        );
      }

      updateData.email = email.trim();
    }

    if (password !== undefined && password.trim()) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Hasło musi mieć co najmniej 6 znaków' },
          { status: 400 }
        );
      }
      updateData.hashedPassword = await hashPassword(password);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Brak danych do aktualizacji' }, { status: 400 });
    }

    // Update user
    const result = await db.collection<User>('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Nie udało się zaktualizować użytkownika' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Użytkownik został zaktualizowany' }, { status: 200 });
  } catch (error) {
    console.error('Update employee error:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}